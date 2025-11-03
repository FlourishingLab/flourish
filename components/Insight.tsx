import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Content {
  name: string;
  rationale: string;
  type: string;
  link: string;
}

interface Habit {
  name: string;
  description: string;
  rationale: string;
}

interface ResultsData {
  inspirational_paragraph: string;
  habit?: Habit;
  contents: Content[];
  additional_paragraph: string;
}

interface Props {
  data: ResultsData;
}

export const Insight: React.FC<Props> = ({ data }) => {
  
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.paragraph}>
        {data.inspirational_paragraph}
      </Text>

      {data.habit && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Recommended Habit</Text>
          <Text style={styles.habitName}>{data.habit.name}</Text>
          <Text style={styles.habitDescription}>{data.habit.description}</Text>
          <Text style={styles.rationale}>{data.habit.rationale}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Resources</Text>
        {data.contents.map((content, index) => (
          <View key={index} style={styles.contentItem}>
            <Text style={styles.contentTitle}>{content.name}</Text>
            <Text style={styles.contentType}>Type: {content.type}</Text>
            <Text style={styles.contentRationale}>{content.rationale}</Text>
            <Text 
              style={styles.link}
              onPress={() => handleLinkPress(content.link)}
            >
              Open Resource →
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.paragraph, styles.additional]}>
        {data.additional_paragraph}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#3b82f6',
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },
  habitDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 12,
  },
  rationale: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  contentItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  contentType: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  contentRationale: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  additional: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
});
