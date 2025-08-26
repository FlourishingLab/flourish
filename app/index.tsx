import Questionnaire from "@/components/Questionnaire";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Path, Svg } from "react-native-svg";

const LogoIcon = () => (
  <Svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <Path
      d="M20 4C11.2 4 4 11.2 4 20s7.2 16 16 16 16-7.2 16-16S28.8 4 20 4zm0 2c7.7 0 14 6.3 14 14s-6.3 14-14 14S6 27.7 6 20 12.3 6 20 6z"
      fill="#3b82f6"
    />
    <Path
      d="M20 10c-2.8 0-5 2.2-5 5 0 1.6.8 3.1 2 4 1.2.9 2 2.3 2 4 0 1.7.9 3.2 2.2 4H20c2.8 0 5-2.2 5-5 0-1.6-.8-3.1-2-4-1.2-.9-2-2.3-2-4 0-2.8-2.2-5-5-5z"
      fill="#3b82f6"
    />
  </Svg>
);

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LogoIcon />
        <Text style={styles.title}>flourish</Text>
      </View>
      <Questionnaire />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 12,
    color: '#3b82f6',
    letterSpacing: -0.5,
  },
});
