import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { capitalizeFirstLetter } from "../../components/upperCase";
import useAuthStore from "../store/useAuthStore";

export default function ProtectedLayOut() {
  const { isLoggedIn, fetchUserProfile, user, isLoading, logout } =
    useAuthStore();

  const router = useRouter();
  useEffect(() => {
    fetchUserProfile();
  }, []);
  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      router.replace("/login");
    }
  };

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => null,

          headerLeft: () =>
            isLoading || !user ? (
              <ActivityIndicator size="small" style={{ marginLeft: 10 }} />
            ) : (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/protectedRoute/profile",
                    params: user,
                  })
                }
                style={styles.userInfo}
              >
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                <Text style={styles.userName}>
                  {capitalizeFirstLetter(user.name)}
                </Text>
              </TouchableOpacity>
            ),
          headerRight: () =>
            isLoading || !user ? (
              <ActivityIndicator size="small" style={{ marginLeft: 10 }} />
            ) : (
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            ),
        }}
      />
      <Stack.Screen name="chat_screen" />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: true,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 16,
            color: "#333",
            fontFamily: "MontBold",
          },
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 6,
  },
  userName: {
    fontSize: 14,
    fontFamily: "MontBold",
  },
  logoutText: {
    color: "red",

    marginRight: 10,
    fontFamily: "MontBold",
  },
});
