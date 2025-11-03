import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import { useInsightStream } from "../../contexts/InsightStream";
import { apiBase } from "../../utils/apiBase";

const SettingsScreen = (): React.ReactElement => {
  const { disconnectStream, connectStream } = useInsightStream();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID on mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch(`${apiBase()}/v1/user/id`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data?.uid || null);
        } else {
          console.error("Failed to fetch user ID:", res.status);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  const handleReset = async () => {
    try {
      // delete user data
      const resp = await fetch(`${apiBase()}/v1/user/reset`, {
        method: "GET",
        credentials: "include",
      });
      if (!resp.ok) {
        throw new Error(`Failed to clear user data. Status: ${resp.status}`);
      }

      router.replace("/");
    } catch (error) {
      console.error("Error resetting session:", error);
      Alert.alert("Error", "Failed to reset session.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.label}>User ID:</Text>
      <Text style={styles.userId}>{userId}</Text>
      <Button title="Reset Session" onPress={handleReset} color="#d9534f" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  userId: {
    fontSize: 16,
    marginBottom: 30,
    color: "#6b7280",
  },
});

export default SettingsScreen;