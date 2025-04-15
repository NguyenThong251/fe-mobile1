import { View, Text } from "react-native";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import styles from "@/assets/styles/profile.styles";
import { Image } from "expo-image";
import { formatMenberSince } from "@/lib/utils";
export default function ProfileHeader() {
  const { user } = useAuthStore();
  if (!user) return null;
  return (
    <View style={styles.profileHeader}>
      <Image
        source={{
          //   uri: user.profileImages || "https://api.dicebear.com/9.x/lorelei/svg",
          uri: "https://api.dicebear.com/9.x/lorelei/svg",
        }}
        style={styles.profileImage}
      />
      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.memberSince}>
          Joined
          {formatMenberSince(user.createdAt)}
        </Text>
      </View>
    </View>
  );
}
