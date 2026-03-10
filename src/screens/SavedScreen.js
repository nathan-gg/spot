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
// get the instance of the Firestore database so that we can interact with the data for showing the list and removing saved spots
import { db, firebase_auth } from "../firebaseConfig";
// access the device storage using AsyncStorage to get the user's map preference to check before linking to the external map app
import AsyncStorage from "@react-native-async-storage/async-storage";
// import useFocusEffect so that the list will refresh every time the page is re-opened after saving spots in MapScreen.js
import { useFocusEffect } from "@react-navigation/native";
// necessary for useFocusEffect
import { useCallback } from "react";

export default function SavedScreen() {
  // stores the saved parking spots of the user
  const [savedSpots, setSavedSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);

  // useFocusEffect here instead of useEffect because it needs to run everytime user navigates to SavedScreen.js
  useFocusEffect(
    useCallback(() => {
      // call get parking spots to update the list when the page is focused again
      getSavedParkingSpots();
    }, []),
  );

  // an async function to get the user's saved parking spots
  async function getSavedParkingSpots() {
    try {
      // accesses the savedParkingSpots collection from the Firestore database we made, then checks to get only the documents which have a matching userId value to the current user
      const q = query(
        collection(db, "savedParkingSpots"),
        where("userId", "==", firebase_auth.currentUser.uid),
      );
      // get the snapshot of all the matching documents
      const querySnapshot = await getDocs(q);
      // create an array for the results
      let spots = [];

      querySnapshot.forEach((doc) => {
        // for each document, log the document id and meter id so that we can see if there are any repeat values while debugging
        console.log("doc.id:", doc.id, "meter id:", doc.data().id);
        // store the unique Firestore document id
        spots.push({ firestoreId: doc.id, ...doc.data() });
      });
      // for checking how many saved spots were retrieved for the users account
      console.log("Fetched spots:", spots.length);
      // set the saved spots to the retrieved amount of spots to update the list
      setSavedSpots(spots);
    } catch (error) {
      // catch any errors
      console.error("Error fetching saved spots: ", error);
    }
  }

  // for "unsaving" or removing a saved parking spot from the users account
  async function removeSavedParkingSpot(spotId) {
    console.log("attempting to delete spotId:", spotId);
    try {
      // use deleteDec to directly delete the document from Firestore
      await deleteDoc(doc(db, "savedParkingSpots", spotId));
      // update the local state to remove the saved parking spot
      setSavedSpots(savedSpots.filter((spot) => spot.firestoreId !== spotId));
      // send an alert to the user so they know the removal is done
      Alert.alert("Spot removed!");
    } catch (error) {
      // catch any errors
      console.error("Error removing spot: ", error);
    }
  }

  // this is for determining which app should be open based on the user preferences stored in AsyncStorage
  async function openMapApplication(latitude, longitude) {
    // check the device storage and use getItem() to get the mapPreference value of either google-maps-preference or apple-maps-preference
    const preference = await AsyncStorage.getItem("mapPreference");
    // user prefers google maps
    if (preference === "google-maps-preference") {
      // set url to google maps external link format
      const url = `comgooglemaps://?daddr=${latitude},${longitude}`;
      // create canOpenURL as a boolean the checks if the user has the destination app (ex. Google Maps) downloaded
      const canOpenURL = await Linking.canOpenURL(url);
      // if Google Maps is downloaded, open in the app
      if (canOpenURL) {
        Linking.openURL(url);
      } else {
        // otherwise open on the website
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        );
      }
    } else if (preference === "apple-maps-preference") {
      // repeat the process, but if the user has Apple Maps as their preference
      const url = `maps://?daddr=${latitude},${longitude}`;
      const canOpenURL = await Linking.canOpenURL(url);
      if (canOpenURL) {
        Linking.openURL(url);
      } else {
        // fallback if Apple Maps not available (e.g. Android)
        Linking.openURL(
          `https://maps.apple.com/?daddr=${latitude},${longitude}`,
        );
      }
    } else {
      // if somehow neither Google Maps nor Apple Maps are selected just open a regular google link
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      );
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
