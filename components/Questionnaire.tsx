import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { QuestionnaireResults } from "./QuestionnaireResults";
import { Question } from "./types";

interface ResultsData {
  inspirational_paragraph: string;
  habit: {
    name: string;
    description: string;
    rationale: string;
  };
  contents: Array<{
    name: string;
    rationale: string;
    type: string;
    link: string;
  }>;
  additional_paragraph: string;
}

function Questionnaire(): React.ReactElement {
  const [questions, setQuestions] = useState<[string, Question][]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Try to get stored userId first
        let storedUserId = await AsyncStorage.getItem('userId');
        let userId;

        if (storedUserId) {
          // Validate existing userId with backend
          try {
                        const validateRes = await fetch(`http://localhost:8080/v1/userid/${storedUserId}`, {
              method: "GET",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
              },
              mode: "cors"
            });
            
            if (validateRes.ok) {
              const validationData = await validateRes.json();
              const returnedId = typeof validationData === 'object' && validationData !== null 
                ? validationData.userId 
                : String(validationData);

              if (returnedId === storedUserId) {
                // User ID exists in backend and matches, keep using it
                userId = storedUserId;
              } else {
                // Backend returned a different ID, flush storage and use new ID
                console.log('Backend returned different ID, updating local storage');
                await AsyncStorage.clear(); // Clear all stored data
                await AsyncStorage.setItem('userId', returnedId);
                userId = returnedId;
              }
            } else {
              // User ID not found in backend, need new one
              storedUserId = null;
            }
          } catch (err) {
            console.error('Failed to validate user ID:', err);
            storedUserId = null;
          }
        }
        
        // If no valid storedUserId, fetch a new one
        if (!storedUserId) {
                    const userIdRes = await fetch("http://localhost:8080/v1/userid", {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            mode: "cors"
          });
          if (!userIdRes.ok) {
            throw new Error('Failed to fetch user ID');
          }
          const userIdData = await userIdRes.json();
          userId = typeof userIdData === 'object' && userIdData !== null 
            ? userIdData.userId 
            : String(userIdData);
          
          // Store the new userId
          await AsyncStorage.setItem('userId', userId);
        }
        
        // Fetch questions
        const questionsRes = await fetch("http://localhost:8080/v1/questions", {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
        });
        if (!questionsRes.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const questionsData = await questionsRes.json();
        console.log('Received questions:', questionsData);
        console.log('Using userId:', storedUserId);
        
        const questionEntries = Object.entries(questionsData as Record<string, Question>);
        setQuestions(questionEntries);
        setUserId(userId);
        
        // Load stored answers
        try {
          const storedAnswers = await AsyncStorage.getItem('answers');
          if (storedAnswers) {
            setAnswers(JSON.parse(storedAnswers));
          }
        } catch (err) {
          console.error("Failed to load stored answers:", err);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

    const handleAnswer = async (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    try {
      // Only store answers locally
      await AsyncStorage.setItem('answers', JSON.stringify(newAnswers));
      console.log("Stored answer locally:", { questionId, value });
    } catch (err) {
      console.error("Failed to store answer locally:", err);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare answers for all questions, using default value 5 for unanswered ones
      const allAnswers = questions.reduce((acc, [id]) => ({
        ...acc,
        [id]: answers[id] || 5 // Default value 5 for unanswered questions
      }), {} as Record<string, number>);
      
      // Save all answers locally
      await AsyncStorage.setItem('answers', JSON.stringify(allAnswers));
      setAnswers(allAnswers);

      // Submit all answers in one request
      const answersArray = Object.entries(allAnswers).map(([questionId, value]) => ({
        questionId: parseInt(questionId, 10), // Convert string ID to number
        value
      }));

            const submitRes = await fetch("http://localhost:8080/v1/responses", {
        method: "POST",
        headers: { 
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          userId,
          answers: answersArray
        })
      });

      if (!submitRes.ok) {
        throw new Error('Failed to submit answers');
      }

      // Then proceed with LLM analysis
      const response = await fetch(`http://localhost:8080/v1/topics/llm/${userId}/`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      
      if (!response.ok) {
        throw new Error('Failed to get LLM analysis');
      }
      
      const responseData = await response.json();
      
      // Handle case where the response might be a string
      const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
      console.log('LLM response:', data);

      console.log('Fields present:', {
        hasInspirationParagraph: Boolean(data?.inspirational_paragraph),
        hasHabit: Boolean(data?.habit),
        hasHabitName: Boolean(data?.habit?.name),
        hasHabitDescription: Boolean(data?.habit?.description),
        hasHabitRationale: Boolean(data?.habit?.rationale),
        hasContents: Boolean(data?.contents),
        isContentsArray: Array.isArray(data?.contents),
        contentsLength: data?.contents?.length
      });

      // Basic validation
      if (!data) {
        console.error('Response is null or undefined:', data);
        throw new Error('Empty response from server');
      }

      if (typeof data !== 'object' || data === null) {
        console.error('Response is not an object:', {
          value: data,
          type: typeof data,
          isArray: Array.isArray(data),
          constructor: data?.constructor?.name
        });
        throw new Error('Invalid response format from server');
      }

      // Individual field validation with specific error messages
      if (!data.inspirational_paragraph) {
        console.error('Missing inspirational_paragraph');
        throw new Error('Missing inspirational paragraph in response');
      }

      if (!data.habit || typeof data.habit !== 'object') {
        console.error('Missing or invalid habit object');
        throw new Error('Missing habit information in response');
      }

      if (!data.habit.name || !data.habit.description || !data.habit.rationale) {
        console.error('Missing habit fields:', data.habit);
        throw new Error('Incomplete habit information in response');
      }

      if (!Array.isArray(data.contents)) {
        console.error('Contents is not an array:', data.contents);
        throw new Error('Invalid contents format in response');
      }

      if (data.contents.length === 0) {
        console.error('Contents array is empty');
        throw new Error('No content items in response');
      }

      setResults(data);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to process results');
      setIsSubmitting(false); // Reset submitting state if there's an error
      return; // Don't proceed to results view if there's an error
    }
    
    setIsSubmitting(false);
  };

  if (isSubmitting || results) {
    return <QuestionnaireResults isLoading={isSubmitting} data={results} />;
  }

  return (
    <ScrollView>
      {userId && (
        <Text style={styles.userid}>User ID: {userId}</Text>
      )}
      {isLoading ? (
        <Text style={styles.question}>Loading questions...</Text>
      ) : error ? (
        <Text style={[styles.question, { color: 'red' }]}>{error}</Text>
      ) : (
        questions.map(([id, q]) => (
          <View style={styles.container} key={id}>
            <Text style={styles.question}>{q.text}</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.label}>{q.minLabel}</Text>
              <Slider
                style={{ flex: 1 }}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={answers[id] || 5}
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#3b82f6"
                onValueChange={(v) => handleAnswer(id, v)}
              />
              <Text style={styles.label}>{q.maxLabel}</Text>
            </View>
            <Text style={styles.value}>{answers[id] || 5}</Text>
          </View>
        ))
      )}
      <Button 
        title="Get Personalized Insights" 
        onPress={handleSubmit}
        disabled={isLoading || Object.keys(answers).length === 0}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  userid: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
    color: '#4b5563',
  },
  question: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "600",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    width: 80,
    textAlign: "center",
    fontSize: 14,
    color: "#555",
  },
  value: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default Questionnaire;
