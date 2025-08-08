import { useHeaderHeight } from "@react-navigation/elements";
import { format } from "date-fns";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Send } from "lucide-react-native";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
// import { useSocket } from "../../utils/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

// Custom Socket Hook
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

const ChatScreen = () => {
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const markCount = useChatStore((state) => state.markCount);
  const updateChatPreview = useChatStore((state) => state.updateChatPreview);
  const loading = useChatStore((state) => state.loading);
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);
  const resetMessages = useChatStore((state) => state.resetMessages);
  const userProfile = useAuthStore((state) => state.user);
  const user = useLocalSearchParams();
  const { emit, on, isConnected } = useSocket();
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");

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
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: "#222",
              fontFamily: "MontMed",
            }}
          >
            {user.name}
          </Text>
        </View>
      ),
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
    emit("mark-read", { from: user?.id });

    markCount(user?.id);
  }, [emit, user?.id]);

  const handleStillInChat = useCallback(() => {
    emit("mark-read", { from: user?.id });
    markCount(user?.id);
  }, [markCount, emit]);

  useEffect(() => {
    const handleMessage = (data) => {
      console.log(data);
      addMessage(data);
      handleStillInChat();
      updateChatPreview(data, userProfile);
    };

    const cleanup = on("chatMessage", handleMessage);
    return cleanup;
  }, [on, userProfile]);

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
          marginHorizontal: 10,
          marginVertical: 4,
        }}
      >
        <View
          style={{
            backgroundColor: isMe ? "#DCF8C6" : "#FFFFFF",
            padding: 10,
            borderRadius: 12,
            maxWidth: "75%",
            borderTopLeftRadius: isMe ? 12 : 0,
            borderTopRightRadius: isMe ? 0 : 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 1,
            elevation: 1,
          }}
        >
          <Text style={{ fontSize: 16, color: "#111", fontFamily: "MontMed" }}>
            {item.message}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "MontMed",
              color: "#666",
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
      style={{ flex: 1, backgroundColor: "#E5DDD5" }}
      edges={["bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#E5DDD5" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        keyboardVerticalOffset={80}
      >
        <View>
          <Text>{isConnected ? "connected" : "disconne"}</Text>
        </View>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" />
          </View>
        ) : messages.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>No messages yet</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index} //console.log(item, "hhssh")}
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

        {/* <LegendList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => console.log(`${item._id}`)}
          recycleItems={true}
          initialScrollOffset={messages.length - 1}
          alignItemsAtEnd
          maintainScrollAtEnd
          maintainScrollAtEndThreshold={0.5}
          maintainVisibleContentPosition
          estimatedItemSize={100}
        /> */}

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            // backgroundColor: "#fff",
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: "#ddd",
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#f0f0f0",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === "ios" ? 12 : 8,
              marginRight: 8,
              maxHeight: 100,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message"
              placeholderTextColor="#666"
              multiline
              style={{
                fontSize: 16,
                fontFamily: "MontMed",
                color: "#000",
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
              backgroundColor: inputText.trim() ? "#128C7E" : "#ccc",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
