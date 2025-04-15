import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "@/constants/api";
import { useAuthStore } from "@/store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "@/components/ProfileHeader";
import LogoutButton from "@/components/LogoutButton";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import Loader from "@/components/Loader";
interface TBook {
  _id: string;
  title: string;
  caption: string;
  image: string;
  rating: number;
  user: {
    _id: string;
    username: string;
    profileImages?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// API response type
interface ApiResponse {
  books: TBook[];
  currentPage: number;
  totalPages: number;
}
export default function profile() {
  const { token, logout } = useAuthStore();
  const [books, setBooks] = useState<TBook[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [deleteBookId, setDeleteBookId] = useState<string>("");
  const router = useRouter();
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const res = await axios.get(`${API_URL}/api/book`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 200) {
        throw new Error(res.data.message);
      }
      setBooks(res.data.books);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to load profile data. Pull down to refresh."
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const renderRattingStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={16}
          color={i < rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };
  const confirmDelete = async (bookId: string) => {
    setDeleteBookId(bookId);
    try {
      const res = await axios.delete(`${API_URL}/api/book/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res);
      if (res.status !== 200) {
        throw new Error(res.data.message);
      }
      setBooks(books.filter((book) => book._id !== bookId));
      Alert.alert("Success", "Book deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to delete book");
    } finally {
      setDeleteBookId("");
    }
  };
  const renderBookItem = ({ item }: { item: TBook }) => {
    return (
      <View style={styles.bookItem}>
        <Image
          source={{ uri: item.image }}
          style={styles.bookImage}
          contentFit="cover"
        />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <View style={styles.ratingContainer}>
            {renderRattingStars(item.rating)}
          </View>
          <Text style={styles.bookCaption} numberOfLines={2}>
            {item.caption}
          </Text>
          <Text style={styles.bookDate}>{item.createdAt}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item._id)}
        >
          {/* <Ionicons name="trash-outline" size={20} color={COLORS.primary} /> */}
          {deleteBookId === item._id ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>
    );
  };
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(1000);
    await fetchData();
    setRefreshing(false);
  };
  if (isLoading && !refreshing) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />
      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Recommendations</Text>
        <Text style={styles.booksCount}>{books.length} books</Text>
      </View>
      {/*  */}
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={50}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No books found</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Add a book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
