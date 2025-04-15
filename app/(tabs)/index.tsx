import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { API_URL } from "@/constants/api";
import styles from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import { formatPublishDate } from "@/lib/utils";
import Loader from "@/components/Loader";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
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

export default function Home() {
  const { token } = useAuthStore();
  const [books, setBooks] = useState<TBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }
      const res = await axios.get(
        `${API_URL}/api/book?page=${pageNum}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status !== 200) {
        throw new Error(res.data.message);
      }
      if (refresh || pageNum === 1) {
        setBooks(res.data.books);
      } else {
        // Otherwise, append new books, but filter out duplicates based on _id
        setBooks((prevBooks) => {
          const existingIds = new Set(prevBooks.map((book) => book._id));
          const newBooks = res.data.books.filter(
            (book: TBook) => !existingIds.has(book._id)
          );
          return [...prevBooks, ...newBooks];
        });
      }
      setHasMore(pageNum < res.data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.log(error);
    } finally {
      if (refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    fetchBooks();
  }, []);
  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      // await sleep(1000);
      await fetchBooks(page + 1);
    }
  };
  const onRefresh = async () => {
    setBooks([]);
    setPage(1);
    setHasMore(true);
    await fetchBooks(1, true);
  };

  const renderItem: ListRenderItem<TBook> = ({ item }) => {
    return (
      <View style={styles.bookCard}>
        <View style={styles.bookHeader}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri:
                  // item.user.profileImages ||
                  "https://api.dicebear.com/9.x/lorelei/svg",
              }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{item.user.username}</Text>
          </View>
        </View>
        <View style={styles.bookImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.bookImage}
            contentFit="cover"
          />
        </View>
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <View style={styles.ratingContainer}>
            {renderRattingStars(item.rating)}
          </View>
          <Text style={styles.caption}>{item.caption}</Text>
          <Text style={styles.date}>
            Shared on {formatPublishDate(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderRattingStars = (rating: any) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };
  if (loading) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBooks(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>
              Share your favourite reads with the world
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={COLORS.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No books found</Text>
            <Text style={styles.emptySubtext}>
              {" "}
              Share your favourite reads with the world
            </Text>
          </View>
        }
      />
    </View>
  );
}
