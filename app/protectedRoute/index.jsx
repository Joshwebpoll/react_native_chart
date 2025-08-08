import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { formatChatTime } from "../../components/timeFormat";

import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";
import ChatPreview from "./../../components/chatPreview";
const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("token");
      console.log(token, "tgsisjs");
      if (token) {
        // Dynamic import to avoid SSR issues
        import("socket.io-client").then(({ io }) => {
          const newSocket = io("https://buddy-chat-backend-ii8g.onrender.com", {
            auth: { token },
          });

          newSocket.on("connect", () => setIsConnected(true));
          newSocket.on("disconnect", () => setIsConnected(false));

          setSocket(newSocket);

          return () => {
            newSocket.disconnect();
          };
        });
      }
    };
    init();
  }, []);

  const emit = useCallback(
    (event, data) => {
      socket?.emit(event, data);
    },
    [socket]
  );

  const on = useCallback(
    (event, callback) => {
      if (!socket) return () => {};

      socket.on(event, callback);
      return () => socket.off(event, callback);
    },
    [socket]
  );

  return { isConnected, emit, on, socket };
};

export default function Index() {
  const navigation = useNavigation();
  const router = useRouter();
  const { emit, on, isConnected } = useSocket();

  const {
    fetchUsers,
    messagePreview,
    previews,
    users,
    updateChatPreview,
    loading,
  } = useChatStore();
  const { fetchUserProfile, user } = useAuthStore();

  useEffect(() => {
    fetchUsers();
    fetchUserProfile();
    messagePreview();
  }, [messagePreview, fetchUsers, fetchUserProfile]);

  useEffect(() => {
    const handleMessage = (data) => {
      console.log(data);
      updateChatPreview(data, user);
    };
    const cleanup = on("chatMessage", handleMessage);
    // return cleanup; // ✅ Proper cleanup
  }, [on]);

  const filteredPeople = users.filter(
    (person) =>
      !previews.some((preview) => preview.userId === person._id) &&
      person._id !== user?._id
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  console.log(previews, "frim er");
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>{isConnected ? "connceted" : "disconn"}</Text>
      </View>
      <FlatList
        data={previews}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <ChatPreview
            name={item.name}
            imageUrl={item.imageUrl}
            latestMessage={item.latestMessage}
            time={formatChatTime(item.createdAt)}
            unreadCount={item.unreadCount}
            onPress={() =>
              router.push({
                pathname: "/protectedRoute/chat_screen",
                params: {
                  id: item.userId,
                  name: item.name,
                  imageUrl: item.imageUrl,
                },
              })
            }
          />
        )}
        ListHeaderComponent={() => (
          <ActiveUsersList
            users={filteredPeople}
            onUserPress={(person) =>
              router.push({
                pathname: "/protectedRoute/chat_screen",
                params: {
                  id: person._id,
                  name: person.name,
                  imageUrl: person.imageUrl,
                },
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

// ------------------------
// Active Users Component
// ------------------------
function ActiveUsersList({ users, onUserPress }) {
  if (!users.length) return null;

  return (
    <View style={styles.activeUsersContainer}>
      <Text style={styles.sectionTitle}>Active Users</Text>
      <FlatList
        data={users}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.activeUserCard}
            onPress={() => onUserPress(item)}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.activeUserAvatar}
            />
            <Text numberOfLines={1} style={styles.activeUserName}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

// ------------------------
// Styles
// ------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 30,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeUsersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 10,
    color: "#333",
  },
  activeUserCard: {
    alignItems: "center",
    width: 60,
  },
  activeUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
  },
  activeUserName: {
    fontSize: 12,
    textAlign: "center",
    color: "#555",
  },
});
