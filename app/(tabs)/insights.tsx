import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Insight } from "../../components/Insight";
import { apiBase } from "../../utils/apiBase";

export default function InsightsScreen() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<Record<string, string> | null>(
    null
  );
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setError(null);

  const response = await fetch(`${apiBase()}/v1/insights/llm`, { credentials: "include" });

      if (!response.ok) {
        throw new Error("Failed to get insights");
      }

      const responseData = await response.json();

      if (responseData && Object.keys(responseData).length > 0) {
        setInsights(responseData);
      } else {
        setInsights(null); // No insights available
      }
    } catch (err) {
      console.error("Error getting insights:", err);
      setError(err instanceof Error ? err.message : "Failed to get insights");
    }
  }, []);

  useEffect(() => {
    fetchInsights();
    setSelectedInsight(null); // Reset to the insights buttons view on tab focus
  }, [fetchInsights]);

  useFocusEffect(
    React.useCallback(() => {
      fetchInsights();
      setSelectedInsight(null); // Reset to the insights buttons view on tab focus
    }, [fetchInsights])
  );

  const handleInsightPress = (insightKey: string) => {
    if (insights && insights[insightKey]) {
      try {
        const parsedInsight = JSON.parse(insights[insightKey]);
        setSelectedInsight(parsedInsight);
      } catch (e) {
        setError("Failed to parse insight data.");
        console.error("Parsing error:", e);
      }
    }
  };

  const generateHolisticInsight = async () => {
    setIsGenerating(true);
    setError(null);
    try {
  const response = await fetch(`${apiBase()}/v1/insights/llm/generate/holistic`, { credentials: "include" });

      if (!response.ok) {
        throw new Error("Failed to trigger holistic insight generation.");
      }

      const result = await response.json();
      if (result.success) {
        fetchInsights();
      } else {
        throw new Error("Holistic insight generation failed.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (selectedInsight) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="< Back to Insights"
            onPress={() => setSelectedInsight(null)}
          />
        </View>
        <Insight data={selectedInsight} />
      </View>
    );
  }


    const holisticInsightAvailable = insights && insights.holistic;


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Personalized Insights</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {!error && (
          <>
            {insights ? (
              <View>
                <Text style={styles.description}>
                  Select an area to view your personalized insights.
                </Text>
                {Object.keys(insights)
                  .filter((key) => key !== "holistic")
                  .map((key: string) => (
                    <TouchableOpacity
                      key={key}
                      style={styles.button}
                      onPress={() => handleInsightPress(key)}
                    >
                      <Text style={styles.buttonText}>{key}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            ) : (
              <View style={styles.centered}>
                <Text style={styles.description}>
                  Answer more questions to unlock more insights
                </Text>
              </View>
            )}

            <View style={styles.holisticContainer}>
              <TouchableOpacity
                style={[styles.holisticButton, !holisticInsightAvailable && styles.disabledButton]}
                disabled={!holisticInsightAvailable}
                onPress={() => handleInsightPress("holistic")}
              >
                <Text style={styles.buttonText}>Holistic Insight</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.generateButtonQuadratic}
                onPress={generateHolisticInsight}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.generateButtonText} numberOfLines={1} adjustsFontSizeToFit>
                    Generate
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row", // Adjusted to align logo and title horizontally
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3b82f6",
    marginLeft: 8, // Space between logo and title
  },
  content: {
    padding: 20,
    alignItems: "stretch", // allow full-width buttons
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: "center",
    color: "#4b5563",
  },
  error: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    height: 56,
    justifyContent: "center",
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  holisticContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  holisticButton: {
    flex: 1,
    backgroundColor: "#10b981",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  generateButtonQuadratic: {
  width: 80,
  height: 56,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: 8,
  },
  generateButtonText: {
    color: "#fff",
  fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  generateButton: {
    marginLeft: 10,
    backgroundColor: "#f59e0b",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
