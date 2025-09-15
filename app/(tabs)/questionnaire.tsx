import Questionnaire from "@/components/Questionnaire";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function QuestionnaireScreen() {
  return (
    <View style={styles.container}>
      <Questionnaire />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
