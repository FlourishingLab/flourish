import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Path, Svg } from "react-native-svg";

const LogoIcon = () => (
  <Svg width="60" height="60" viewBox="0 0 40 40" fill="none">
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

const LogoHeader = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const email = "stephan.horsthemke@gmail.com";
  const onFeedback = () => setShowFeedback(true);

  return (
    <>
      <View style={styles.header}>
        <LogoIcon />
        <Text style={styles.title}>flourish</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Send feedback"
          onPress={onFeedback}
          style={styles.feedbackBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.feedbackText}>Feedback</Text>
        </TouchableOpacity>
      </View>
      <Modal animationType="fade" transparent visible={showFeedback} onRequestClose={() => setShowFeedback(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>We'd love your feedback</Text>
            <Text style={styles.modalText}>
              Share your thoughts, ideas, or anything that's on your mind with Stephan at
            </Text>
            <Text style={styles.modalEmail}>{email}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowFeedback(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: 10,
    paddingBottom: 0,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3b82f6",
    marginLeft: 8,
  },
  feedbackBtn: {
    position: "absolute",
    right: 12,
    top: 8,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  feedbackText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  modalEmail: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  modalButton: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default LogoHeader;
