import { Alert, FlatList, Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { db, firebase_auth } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { savedStyles as styles } from "../styles";

// formats the rate value for display (e.g. "3.5" → "$3.50/hr")
function formatRate(rate) {
  if (!rate) return "Rate unavailable";
  const num = parseFloat(rate);
  if (isNaN(num)) return `${rate}`;
  return `$${num.toFixed(2)}/hr`;
}

// formats a meter time limit value for display
function formatTimeLimit(timeLimit) {
  if (!timeLimit) return "Hours unavailable";
  return `Mon–Fri 9AM–6PM · ${timeLimit} limit`;
}

// formats the meter ID into a readable spot name
function formatSpotName(id) {
  if (!id) return "Parking Spot";
  return `Meter #${id}`;
}

// moves an item in an array from one index to another without mutating the original
function moveItem(arr, fromIndex, toIndex) {
  const updated = [...arr];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return updated;
}

export default function SavedScreen() {
  const [savedSpots, setSavedSpots] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // refresh list every time the tab is focused; exit edit mode on navigate away
  useFocusEffect(
    useCallback(() => {
      getSavedParkingSpots();
      setEditMode(false);
    }, []),
  );

  async function getSavedParkingSpots() {
    try {
      const q = query(
        collection(db, "savedParkingSpots"),
        where("userId", "==", firebase_auth.currentUser.uid),
      );
      const querySnapshot = await getDocs(q);
      const spots = [];
      querySnapshot.forEach((d) => {
        spots.push({ firestoreId: d.id, ...d.data() });
      });
      setSavedSpots(spots);
    } catch (error) {
      console.error("Error fetching saved spots: ", error);
    }
  }

  // delete a spot from Firestore, filter it out of local state, then alert the user
  async function removeSavedParkingSpot(spotId) {
    try {
      await deleteDoc(doc(db, "savedParkingSpots", spotId));
      setSavedSpots((prev) =>
        prev.filter((spot) => spot.firestoreId !== spotId),
      );
      Alert.alert("Saved Spot Removed!");
    } catch (error) {
      console.error("Error removing spot: ", error);
    }
  }

  // move a spot up or down in the list by one position
  function reorderSpot(index, direction) {
    const toIndex = direction === "up" ? index - 1 : index + 1;
    if (toIndex < 0 || toIndex >= savedSpots.length) return;
    setSavedSpots((prev) => moveItem(prev, index, toIndex));
  }

  // open the user's preferred map app with directions to the spot
  async function openMapApplication(latitude, longitude) {
    const preference = await AsyncStorage.getItem("mapPreference");
    if (preference === "google-maps-preference") {
      const url = `comgooglemaps://?daddr=${latitude},${longitude}`;
      const canOpenURL = await Linking.canOpenURL(url);
      if (canOpenURL) {
        Linking.openURL(url);
      } else {
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        );
      }
    } else if (preference === "apple-maps-preference") {
      const url = `maps://?daddr=${latitude},${longitude}`;
      const canOpenURL = await Linking.canOpenURL(url);
      if (canOpenURL) {
        Linking.openURL(url);
      } else {
        Linking.openURL(
          `https://maps.apple.com/?daddr=${latitude},${longitude}`,
        );
      }
    } else {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      );
    }
  }

  function renderSpotCard({ item, index }) {
    const isFirst = index === 0;
    const isLast = index === savedSpots.length - 1;

    return (
      <View style={styles.card}>
        {/* Image area with purple background and spot name */}
        <View style={styles.cardImageArea}>
          <View style={styles.cardImageOverlay} />
          <Text style={styles.cardSpotName}>{formatSpotName(item.id)}</Text>

          {editMode && (
            <>
              {/* ↑ ↓ reorder buttons — left side of image area */}
              <View style={styles.reorderButtons}>
                <TouchableOpacity
                  style={[styles.reorderBtn, isFirst && styles.reorderBtnDisabled]}
                  onPress={() => reorderSpot(index, "up")}
                  disabled={isFirst}
                >
                  <Ionicons name="chevron-up" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reorderBtn, isLast && styles.reorderBtnDisabled]}
                  onPress={() => reorderSpot(index, "down")}
                  disabled={isLast}
                >
                  <Ionicons name="chevron-down" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Red trash delete button — top-right */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeSavedParkingSpot(item.firestoreId)}
              >
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Card body: info rows + action buttons */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="navigate-outline" size={16} color="#807cff" />
            <Text style={styles.infoText}>
              {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#807cff" />
            <Text style={styles.infoText}>{formatRate(item.rate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#807cff" />
            <Text style={styles.infoText}>{formatTimeLimit(item.timeLimit)}</Text>
          </View>

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => openMapApplication(item.latitude, item.longitude)}
          >
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header: title + edit/done toggle */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Spots</Text>
        <TouchableOpacity
          style={[styles.editButton, editMode && styles.editButtonActive]}
          onPress={() => setEditMode(!editMode)}
        >
          <Ionicons
            name={editMode ? "checkmark" : "pencil-outline"}
            size={20}
            color="#6a65fb"
          />
        </TouchableOpacity>
      </View>

      {savedSpots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={48} color="#aaa" />
          <Text style={styles.emptyText}>No saved spots yet</Text>
          <Text style={styles.emptySubtext}>
            Save a spot from the map to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedSpots}
          keyExtractor={(item) => item.firestoreId}
          renderItem={renderSpotCard}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}
