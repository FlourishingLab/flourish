import { Slider } from "@miblanchard/react-native-slider";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { apiBase } from "../utils/apiBase";
import { Question } from "./types";

type Answer = {
  questionId: number;
  value: number;
};

type BackendQuestion = {
  id: string;
  text: string;
  min_label: string;
  max_label: string;
  dimension: string;
  sub_dimension?: string;
  facet?: string;
};

function Questionnaire(): React.ReactElement {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${apiBase()}/v1/questions`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch questions from the backend.");
      }

      const data: BackendQuestion[] = await response.json();
      const mappedData: Question[] = data.map((item: BackendQuestion) => ({
        id: Number(item.id),
        text: item.text,
        minLabel: item.min_label,
        maxLabel: item.max_label,
        dimension: item.dimension,
        subDimension: item.sub_dimension || "",
        facet: item.facet || "",
      }));
  setQuestions(mappedData);
  setAnswers(mappedData.map(q => ({ questionId: q.id, value: 5 })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const getDimensionDisplay = () => {
    const uniqueDimensions = new Set(questions.map(q => q.dimension));
    const uniqueFacets = new Set(questions.map(q => q.facet));

    if (uniqueDimensions.size > 1) {
      return { dimension: "General", subDimension: "", facets: [] };
    }

    const { dimension, subDimension } = questions[0] || {};
    const facets = Array.from(uniqueFacets).filter(facet => facet);
    return { dimension, subDimension, facets };
  };

  const { dimension, subDimension, facets } = getDimensionDisplay();

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(answer =>
        answer.questionId === questionId ? { ...answer, value } : answer
      )
    );
  };

  const submitAnswers = async () => {

    try {
      const response = await fetch(`${apiBase()}/v1/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          answers: answers.map(a => ({
            questionId: a.questionId,
            kind: "SCALE",
            value: a.value,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answers.");
      }

      // Fetch next batch of questions
      fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text>Loading questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!isLoading && questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No more questions available. Please check the Insights tab for personalized recommendations.</Text>
        <Button
          title="Go to Insights"
          onPress={() => router.push('/(tabs)/insights')}
          color="#3b82f6"
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Questionnaire</Text>
      </View>
      <View style={styles.dimensionContainer}>
        <Text style={styles.dimensionText}>{dimension}</Text>
        {subDimension && <Text style={styles.subDimensionText}>{subDimension}</Text>}
        {facets.length > 0 && (
          <Text style={styles.facetsText}>{facets.join(", ")}</Text>
        )}
      </View>
      {questions.map((question, index) => (
        <View key={question.id} style={styles.questionWrapper}>
          <Text style={styles.questionText}>{question.text}</Text>
          <View style={styles.sliderContainer}>
            <Slider
              containerStyle={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={[answers[index]?.value]}
              onValueChange={(value: number[]) => handleAnswerChange(question.id, value[0])}
              minimumTrackTintColor="#3b82f6"
              thumbStyle={{ backgroundColor: "#3b82f6" }}
              trackStyle={{ height: 5, borderRadius: 3 }}
            />
            <Text style={styles.sliderValue}>{answers[index]?.value}</Text>
          </View>
          <View style={styles.labelsContainer}>
            <Text style={styles.labelText}>{question.minLabel}</Text>
            <Text style={styles.labelText}>{question.maxLabel}</Text>
          </View>
        </View>
      ))}
      <Button title="Submit and Next" onPress={submitAnswers} color="#3b82f6" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  questionWrapper: {
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  sliderContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  sliderValue: {
    marginTop: 5,
    fontSize: 14,
    color: "#374151",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelText: {
    fontSize: 12,
    color: "#6b7280",
  },
  dimensionContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  dimensionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
  },
  subDimensionText: {
    fontSize: 14,
    color: "#6b7280",
  },
  facetsText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 5,
  },
});

export default Questionnaire;
