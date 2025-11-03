import { apiBase } from '@/utils/apiBase';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from "react-native-svg";
import LogoHeader from "../components/LogoHeader";
import { useInsightStream } from "../contexts/InsightStream";

export default function WelcomeScreen() {
  const router = useRouter();
  const { setUserIdFromApp, connectStream } = useInsightStream();

  // Ensure a uid exists when landing on the welcome screen (web refresh keeps cookie)
  useEffect(() => {
    (async () => {
      try {
  const res = await fetch(`${apiBase()}/v1/user/id`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const uid = (data && data.uid) || null;
          setUserIdFromApp(uid);
          await connectStream();
        } else {
          console.error("Failed to ensure user id on welcome:", res.status);
        }
      } catch (e) {
        console.error("Error ensuring user id on welcome:", e);
      }
    })();
  }, [setUserIdFromApp, connectStream]);
  
  return (
    <View style={styles.container}>
      <LogoHeader />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.quote}>
          “It is health that is real wealth and not pieces of gold and silver.” - Mahatma Gandhi
        </Text>

        {/* Pitch / Mission goes here */}
        <Text style={styles.description}>
          What's the most important book/article you've ever read? How did you find it?
          Chances are it was pretty random.
          Social media? Nowadays we trust social media algorithms which optimise distraction to give us self-help content.
          A friend? Lucky you that the friend had similar challenges as you. But how many books did you get recommended by friends which did not cut it? 

          Imagine an App which shows you your personalised most important content according to wellbeing science. 

          An App which pushes you to truly invest time into what increases your wellbeing sustainably.

          Content Exploration designed for your Wellbeing!
        </Text>
        
        <View style={styles.featureContainer}>
          <View style={styles.feature}>
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.featureTitle}>Questionnaire</Text>
            <Text style={styles.featureDescription}>
              Answer questions about yourself to help us understand you better.
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.featureTitle}>Personalized Insights</Text>
            <Text style={styles.featureDescription}>
              Get custom recommendations for habits and inspirational content.
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/(tabs)/questionnaire')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 10,
    paddingTop: 10,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#4b5563',
    marginVertical: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#4b5563',
  },
  featureContainer: {
    marginBottom: 40,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  featureDescription: {
    textAlign: 'center',
    color: '#4b5563',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
