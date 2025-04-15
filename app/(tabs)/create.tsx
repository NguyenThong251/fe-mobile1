import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors.js";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { API_URL } from "@/constants/api";
export default function create() {
  const [title, setTitle] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [rating, setRating] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { token, logout } = useAuthStore();

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Sorry, we need camera roll permissions to make this work!"
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          setImageBase64(base64);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick an image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!title || !caption || !imageBase64 || !rating) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      setLoading(true);

      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg";
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      const res = await axios.post(
        `${API_URL}/api/book`,
        {
          title,
          caption,
          image: imageDataUrl,
          rating: rating.toString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        Alert.alert("Success", "Book added successfully");
        setTitle("");
        setCaption("");
        setImage("");
        setImageBase64("");
        setRating(3);
        router.push("/");
      }
    } catch (error: any) {
      let errorMessage = "Failed to add book. Please try again.";
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (error.response.status === 400) {
          errorMessage = "Invalid data provided. Please check your inputs.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // No response received (e.g., network error)
        errorMessage = "Network error. Please check your connection.";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderRattingPicker = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}> Share your favourate reads</Text>
          </View>
          <View style={styles.form}>
            <View style={styles.form}>
              {/* BOOK TITLE */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Book title</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="book-outline"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholderTextColor={COLORS.placeholderText}
                    placeholder="Book title"
                    value={title}
                    onChangeText={(text) => setTitle(text)}
                  />
                </View>
              </View>
              {/* RATING */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Your Rating</Text>
                {renderRattingPicker()}
              </View>
              {/* IMAGE */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Book Image</Text>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={pickImage}
                >
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons
                        name="image-outline"
                        size={40}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.placeholderText}>
                        Select an image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              {/* CAPTION */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Caption</Text>
                <TextInput
                  style={styles.textArea}
                  placeholderTextColor={COLORS.placeholderText}
                  placeholder="Write a caption..."
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                />
              </View>
              {/* SUBMIT */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color={COLORS.white}
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Share</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
