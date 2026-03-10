// UI components and Linking from React Native
import { View, Text, FlatList, Button, Linking, Alert } from "react-native";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { db, firebase_auth } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function SavedScreen() {
  const [savedSpots, setSavedSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);

  // useFocusEffect here instead of useEffect because it needs to run everytime user navigates to SavedScreen.js
  useFocusEffect(
    useCallback(() => {
      getSavedParkingSpots();
    }, []),
  );

  async function getSavedParkingSpots() {
    try {
      const q = query(
        collection(db, "savedParkingSpots"),
        where("userId", "==", firebase_auth.currentUser.uid),
      );
      const querySnapshot = await getDocs(q);
      let spots = [];
      querySnapshot.forEach((doc) => {
        console.log("doc.id:", doc.id, "meter id:", doc.data().id);

        spots.push({ firestoreId: doc.id, ...doc.data() });
      });
      console.log("Fetched spots:", spots.length);
      setSavedSpots(spots);
    } catch (error) {
      console.error("Error fetching saved spots: ", error);
    }
  }

  async function removeSavedParkingSpot(spotId) {
    console.log("attempting to delete spotId:", spotId);
    try {
      await deleteDoc(doc(db, "savedParkingSpots", spotId));
      // update the local state to remove the spot without refetching
      setSavedSpots(savedSpots.filter((spot) => spot.firestoreId !== spotId));
      Alert.alert("Spot removed!");
    } catch (error) {
      console.error("Error removing spot: ", error);
    }
  }

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
    } else {
      Linking.openURL(`maps://?daddr=${latitude},${longitude}`);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#ff9ae7" }}>
      {savedSpots.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>No saved spots yet.</Text>
        </View>
      ) : (
        <FlatList
          data={savedSpots}
          keyExtractor={(item) => item.firestoreId}
          renderItem={({ item }) => (
            <View
              style={{ padding: 15, borderBottomWidth: 1, borderColor: "#ccc" }}
            >
              <Text>{item.rate}/hr</Text>
              <Text>{item.timeLimit}</Text>
              <Button
                title="Unsave"
                onPress={() => removeSavedParkingSpot(item.firestoreId)}
              />
              <Button
                title="Go Here"
                onPress={() =>
                  openMapApplication(item.latitude, item.longitude)
                }
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
