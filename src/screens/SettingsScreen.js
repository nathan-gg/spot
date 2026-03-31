import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  doc,
} from "firebase/firestore";
import { db, firebase_auth } from "../firebaseConfig";

// Options for map and vehicle selections
const MAP_OPTIONS = [
  { label: "Google Maps", value: "google-maps-preference" },
  { label: "Apple Maps", value: "apple-maps-preference" },
];
const VEHICLE_OPTIONS = ["SUV", "SEDAN", "PICK-UP", "VAN"];

export default function SettingsScreen() {
  const [mapPreference, setMapPreference] = useState(null); // which map is selected
  const [vehicleType, setVehicleType] = useState(null); // which vehicle is selected
  const [loading, setLoading] = useState(true); // shows spinner on first load
  const [saving, setSaving] = useState(false); // shows spinner when saving vehicle
  const [userPrefDocId, setUserPrefDocId] = useState(null); // stores the Firestore doc ID so we can update it later

  const uid = firebase_auth.currentUser?.uid; // get the current logged-in user's ID

  // Runs once when the screen loads — fetches saved preferences
  useEffect(() => {
    async function loadPreferences() {
      try {
        // MAP: stored locally on the device with AsyncStorage
        const storedMap = await AsyncStorage.getItem("mapPreference");
        if (storedMap) setMapPreference(storedMap);

        // VEHICLE: stored in Firestore, find the doc where userId matches
        if (uid) {
          const q = query(
            collection(db, "userPreferences"),
            where("userId", "==", uid),
          );
          const snapshot = await getDocs(q); // run the query

          if (!snapshot.empty) {
            const docSnap = snapshot.docs[0]; // grab the first (and only) result
            setUserPrefDocId(docSnap.id); // save doc ID for later updates
            const data = docSnap.data();
            if (data.defaultVehicle && data.defaultVehicle !== "null") {
              setVehicleType(data.defaultVehicle); // restore the saved vehicle selection
            }
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setLoading(false); // hide the spinner whether it succeeded or failed
      }
    }

    loadPreferences();
  }, [uid]);

  // Called when user taps a map option — saves to device storage only
  async function handleMapPreferenceChange(value) {
    try {
      await AsyncStorage.setItem("mapPreference", value); // save to device
      setMapPreference(value); // update the UI
    } catch (error) {
      Alert.alert("Error", "Could not save map preference.");
    }
  }

  // Called when user taps a vehicle option — saves to Firestore
  async function handleVehicleChange(value) {
    setSaving(true);
    try {
      if (userPrefDocId) {
        // Doc already exists — just update the vehicle field
        await updateDoc(doc(db, "userPreferences", userPrefDocId), {
          defaultVehicle: value,
        });
      } else {
        // First time — create a new doc for this user
        const newDoc = await addDoc(collection(db, "userPreferences"), {
          userId: uid,
          defaultVehicle: value,
        });
        setUserPrefDocId(newDoc.id); // save the new doc ID so future taps update instead of create
      }
      setVehicleType(value); // update the UI
    } catch (error) {
      Alert.alert("Error", "Could not save vehicle preference.");
    } finally {
      setSaving(false); // hide the saving spinner
    }
  }

  // Show a spinner while loading preferences on first open
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: "#ffe371" }}>
      {/* MAP PREFERENCE */}
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Map Preference
      </Text>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
        {MAP_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleMapPreferenceChange(option.value)}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 10,
              borderWidth: 2,
              alignItems: "center",
              borderColor: mapPreference === option.value ? "#6a65fb" : "#ccc", // purple if selected
              backgroundColor:
                mapPreference === option.value ? "#ede9ff" : "#fff", // light purple if selected
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: mapPreference === option.value ? "#6a65fb" : "#333",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* VEHICLE TYPE */}
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
        My Vehicle
      </Text>
      <Text style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
        Select your vehicle type to help filter spots easier
      </Text>
      {saving && <ActivityIndicator style={{ marginBottom: 8 }} />}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 40,
        }}
      >
        {VEHICLE_OPTIONS.map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => handleVehicleChange(v)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: vehicleType === v ? "#6a65fb" : "#ccc", // purple if selected
              backgroundColor: vehicleType === v ? "#ede9ff" : "#fff", // light purple if selected
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: vehicleType === v ? "#6a65fb" : "#333",
              }}
            >
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SIGN OUT */}
      <Button onPress={() => firebase_auth.signOut()} title="Sign Out" />
    </View>
  );
}
