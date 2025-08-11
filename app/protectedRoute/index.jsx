import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
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

import { StatusBar } from "expo-status-bar";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";
import useSocketStore from "../store/useSocketStore";
import ChatPreview from "./../../components/chatPreview";

export default function Index() {
  const navigation = useNavigation();
  const router = useRouter();

  const {
    fetchUsers,
    messagePreview,
    previews,
    users,
    updateChatPreview,
    loading,
    addMessage,
    markCount,
  } = useChatStore();
  const initSocket = useSocketStore((state) => state.initSocket);
  const { fetchUserProfile, user } = useAuthStore();
  const { emit, on, off, isConnected } = useSocketStore();
  const { activeChatId } = useChatStore.getState();

  useEffect(() => {
    initSocket(); // only once when app starts
  }, []);
  useEffect(() => {
    fetchUsers();
    fetchUserProfile();
    messagePreview();
  }, [messagePreview, fetchUsers, fetchUserProfile]);

  useEffect(() => {
    if (!isConnected) return;
    const handleMessage = (data) => {
      updateChatPreview(data, user);
      addMessage(data);

      if (data.senderUser._id === activeChatId) {
        emit("mark-read", { from: activeChatId });
        markCount(activeChatId);
      }
    };

    on("chatMessage", handleMessage);

    return () => {
      off("chatMessage", handleMessage);
    };
  }, [on, off, isConnected, activeChatId]);
  const filteredPeople = users.filter(
    (person) =>
      !previews.some((preview) => preview.userId === person._id) &&
      person._id !== user?._id
  );

  // const showErrorExample = () => {
  //   ToastManager.success("Operation completed!");
  // };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
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
