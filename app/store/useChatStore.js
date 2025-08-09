import { create } from "zustand";
import api from "../../utils/axios";
// Use the custom axios instance

const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  previews: [],
  loading: false,
  error: null,
  hasMore: true,
  skip: 0,
  limit: 10,
  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/auth/profile`);
      set({ users: res.data.users, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  fetchMessages: async (chatId) => {
    // let chatI = "687e418d0ba1cb106a9a33ed";
    const { skip, limit, messages, hasMore, loading } = get();
    if (!hasMore || loading) return;
    set({ loading: true, error: null });
    try {
      const res = await api.get(
        `/chat/get-previous/${chatId}?skip=${skip}&limit=${limit}`
      );
      const newMessages = res.data.messages;
      set({
        messages: [...newMessages.reverse(), ...messages],
        skip: skip + newMessages.length,
        hasMore: newMessages.length === limit,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },
  resetMessages: () => {
    set({ messages: [], skip: 0, hasMore: true });
  },
  messagePreview: async () => {
    try {
      const res = await api.get(`/chat/preview`);

      set({ previews: res.data });
    } catch (err) {
      console.log("Send message error:", err);
    }
  },

  updateChatPreview: (msg, user) => {
    const isSender = msg.sender === user?._id;
    const otherUserId = isSender ? msg.receiver : msg.sender;
    console.log(isSender);
    set((state) => {
      const previews = state.previews || [];

      // Check if preview already exists
      const existingIndex = previews.findIndex(
        (data) => data.userId === otherUserId
      );

      let updatedPreview;

      if (existingIndex !== -1) {
        const existing = previews[existingIndex];

        updatedPreview = {
          ...existing,
          latestMessage: msg.message,
          //name: msg.name ? msg.name : msg.senderUser.name,
          //imageUrl: msg.imageUrl ? msg.imageUrl : msg.senderUser.imageUrl,
          createdAt: Date.now(),
          unreadCount: isSender ? 0 : existing.unreadCount + 1,
        };

        // Remove existing and reinsert at top
        const newPreviews = [
          updatedPreview,
          ...previews.filter((_, i) => i !== existingIndex),
        ];

        return { previews: newPreviews };
      } else {
        // Add new preview at top
        updatedPreview = {
          userId: otherUserId,
          name: otherUserId ? msg.name : msg.senderUser.name,
          latestMessage: msg.message,
          imageUrl: otherUserId ? msg.senderUser.imageUrl : msg.imageUrl,
          createdAt: Date.now(),
          unreadCount: isSender ? 0 : 1,
        };

        return { previews: [updatedPreview, ...previews] };
      }
    });
  },

  markRead: (user, emit) => {
    emit("mark-read", { from: user?.id });
  },

  markCount: async (userid) => {
    console.log(userid, "cunt");
    try {
      set((state) => {
        const update = state.previews.map((data) => {
          console.log(data);
          if (data?.userId === userid) {
            console.log("countsss", data.unreadCount);
            return { ...data, unreadCount: 0 };
          }
          return data;
        });
        // console.log(userid, update, "jjjss");
        return { previews: update };
      });
    } catch (error) {
      console.log(err);
    }
  },

  addMessage: async (message) => {
    try {
      // const res = await api.post(`/chats/${chatId}/messages`, { message });
      set((state) => ({
        messages: [...state.messages, message],
      }));
    } catch (err) {
      console.log("Send message error:", err);
    }
  },
}));

export default useChatStore;
