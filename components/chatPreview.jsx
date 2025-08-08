// components/ChatPreview.js
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ChatPreview = ({
  name,
  imageUrl,
  latestMessage,
  time,
  unreadCount,
  onPress,
}) => {
  console.log(unreadCount);
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.avatar} />

      <View style={styles.textContainer}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.message} numberOfLines={1}>
            {latestMessage}
          </Text>

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontWeight: "600",
    fontFamily: "MontMed",
    fontSize: 16,
    maxWidth: "75%",
  },
  time: {
    fontSize: 12,
    color: "#888",
    fontFamily: "MontMed",
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  message: {
    color: "#666",
    flex: 1,
    marginRight: 8,
    fontFamily: "MontMed",
  },
  badge: {
    backgroundColor: "red",
    borderRadius: 12,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "MontMed",
  },
});

export default ChatPreview;
