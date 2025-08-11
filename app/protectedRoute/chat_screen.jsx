import { useHeaderHeight } from "@react-navigation/elements";
import { format } from "date-fns";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Send } from "lucide-react-native";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";
import useSocketStore from "../store/useSocketStore";

const ChatScreen = () => {
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const markCount = useChatStore((state) => state.markCount);
  const updateChatPreview = useChatStore((state) => state.updateChatPreview);
  const loading = useChatStore((state) => state.loading);
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);
  const resetMessages = useChatStore((state) => state.resetMessages);
  const markRead = useChatStore((state) => state.markRead);
  const userProfile = useAuthStore((state) => state.user);
  const user = useLocalSearchParams();
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const { emit, on, off, isConnected } = useSocketStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: user.imageUrl }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              marginRight: 10,
            }}
          />
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: "#1a1a1a",
              fontFamily: "MontMed",
            }}
          >
            {user.name}
          </Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: "#ffffff",
      },
    });
  }, [navigation, user]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    resetMessages();
    fetchMessages(user?.id);
  }, [user?.id]);

  useEffect(() => {
    setActiveChatId(user?.id);
    emit("mark-read", { from: user?.id });
    markCount(user?.id);
    return () => {
      setActiveChatId(null);
    };
  }, [user?.id]);

  useEffect(() => {
    emit("mark-read", { from: user?.id });
    markCount(user?.id);
  }, [user?.id]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const message = {
        to: user?.id,
        sender: userProfile?._id,
        name: user?.name,
        receiver: user?.id,
        imageUrl: user?.imageUrl,
        message: inputText,
        createdAt: Date.now(),
      };

      emit("chatMessage", message);
      addMessage(message);
      updateChatPreview(message, userProfile);
      setInputText("");

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === userProfile?._id;
    const time = format(new Date(item.createdAt), "hh:mm a");

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: isMe ? "flex-end" : "flex-start",
          marginHorizontal: 16,
          marginVertical: 4,
        }}
      >
        <View
          style={{
            backgroundColor: isMe ? "#007AFF" : "#f0f0f0",
            padding: 12,
            borderRadius: 16,
            maxWidth: "80%",
            borderTopLeftRadius: isMe ? 16 : 4,
            borderTopRightRadius: isMe ? 4 : 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: isMe ? "#ffffff" : "#1a1a1a",
              fontFamily: "MontMed",
            }}
          >
            {item.message}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "MontMed",
              color: isMe ? "rgba(255,255,255,0.7)" : "#666",
              alignSelf: "flex-end",
              marginTop: 4,
            }}
          >
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      edges={["bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : messages.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 32,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                fontFamily: "MontMed",
                textAlign: "center",
              }}
            >
              No messages yet. Start the conversation!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingVertical: 10 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            backgroundColor: "#ffffff",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === "ios" ? 12 : 8,
              marginRight: 10,
              maxHeight: 100,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message"
              placeholderTextColor="#999"
              multiline
              style={{
                fontSize: 16,
                fontFamily: "MontMed",
                color: "#1a1a1a",
              }}
            />
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() ? "#007AFF" : "#ccc",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Send size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
