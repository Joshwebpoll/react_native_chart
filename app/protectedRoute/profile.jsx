import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
export default function ProfileScreen() {
  const user = {
    name: "Frank Josh",
    email: "frankjosh@example.com",
    imageUrl: "https://i.pravatar.cc/150?img=3", // You can replace with actual avatar
  };
  const { name, email, imageUrl } = useLocalSearchParams();
  const router = useRouter();
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };
  return (
    <View style={styles.container}>
      <Animatable.View
        animation="fadeInLeft"
        duration={800}
        delay={200}
        style={styles.profileSection}
      >
        <Image source={{ uri: imageUrl }} style={styles.avatar} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",

            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Text style={styles.name}>Name</Text>
          <Text style={styles.name}>{name}</Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Text style={styles.name}>Email</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            fontFamily: "MontMed",
            padding: 10,
            borderRadius: 10,
            alignSelf: "center",
          }}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",

    paddingHorizontal: 20,
    backgroundColor: "#F8F8F8",
  },
  //   profileSection: {
  //     flexDirection: "column",
  //     alignItems: "center",

  //     gap: 16, // works in React Native 0.71+, otherwise use marginRight
  //   },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 60,
    marginVertical: 20,
    alignSelf: "center",
  },
  name: {
    fontSize: 16,
    // fontWeight: "600",

    fontFamily: "MontMed",
  },
  email: {
    fontSize: 16,
    color: "#666",
    // fontWeight: "600",
    fontFamily: "MontMed",
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
    marginRight: 10,
    fontSize: 16,
    fontFamily: "MontBold",
    textAlign: "center",
  },
});
