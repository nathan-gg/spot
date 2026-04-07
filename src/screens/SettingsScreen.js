import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, firebase_auth } from "../firebaseConfig";
import { settingsStyles as styles } from "../styles";

const MAP_OPTIONS = [
  { label: "Google Maps", value: "google-maps-preference" },
  { label: "Apple Maps", value: "apple-maps-preference" },
];
const VEHICLE_OPTIONS = ["SUV", "SEDAN", "PICK-UP", "VAN"];

// Helper function to get user initials for avatar

function getInitials(user) {
  if (user?.displayName) {
    const parts = user.displayName.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  if (user?.email) return user.email[0].toUpperCase();
  return "?";
}

// Sub-screen: Personal Info

function PersonalInfoScreen({ onBack }) {
  const user = firebase_auth.currentUser;
  const [name, setName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const emailChanged = email !== user?.email;

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }
    setSaving(true);
    try {
      if (emailChanged) {
        if (!currentPassword) {
          Alert.alert(
            "Password required",
            "To change your email, please enter your current password.",
          );
          setSaving(false);
          return;
        }
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword,
        );
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
      }
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      Alert.alert("Saved", "Your info has been updated.");
      onBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#6a65fb" />
          <Text style={styles.backText}>Account</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Personal Info</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.subContent}>
        <Text style={styles.sectionLabel}>Name</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.fieldInput}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor="#8E8E93"
          />
        </View>

        <Text style={styles.sectionLabel}>Email</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.fieldInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#8E8E93"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {emailChanged && (
          <>
            <Text style={styles.sectionLabel}>Current Password</Text>
            <Text style={styles.helperText}>
              Required to confirm email change
            </Text>
            <View style={styles.card}>
              <TextInput
                style={styles.fieldInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#8E8E93"
                secureTextEntry
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving…" : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-screen: Security 

function SecurityScreen({ onBack }) {
  const user = firebase_auth.currentUser;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("All fields required", "Please fill in every field.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please check your new password.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Too short", "Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert("Done", "Your password has been updated.");
      onBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#6a65fb" />
          <Text style={styles.backText}>Account</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Security</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.subContent}>
        <Text style={styles.sectionLabel}>Current Password</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.fieldInput}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor="#8E8E93"
            secureTextEntry
          />
        </View>

        <Text style={styles.sectionLabel}>New Password</Text>
        <View style={styles.card}>
          <TextInput
            style={[styles.fieldInput, styles.fieldInputBorderBottom]}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor="#8E8E93"
            secureTextEntry
          />
          <TextInput
            style={styles.fieldInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#8E8E93"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleChangePassword}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving…" : "Update Password"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-screen: Vehicle Preference

function VehicleScreen({ onBack }) {
  const uid = firebase_auth.currentUser?.uid;
  const [vehicleType, setVehicleType] = useState(null);
  const [userPrefDocId, setUserPrefDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!uid) { setLoading(false); return; }
      try {
        const q = query(collection(db, "userPreferences"), where("userId", "==", uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setUserPrefDocId(docSnap.id);
          const data = docSnap.data();
          if (data.defaultVehicle && data.defaultVehicle !== "null") {
            setVehicleType(data.defaultVehicle);
          }
        }
      } catch (error) {
        console.error("Error loading vehicle preference:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid]);

  async function handleSelect(value) {
    setSaving(true);
    try {
      if (userPrefDocId) {
        await updateDoc(doc(db, "userPreferences", userPrefDocId), { defaultVehicle: value });
      } else {
        const newDoc = await addDoc(collection(db, "userPreferences"), { userId: uid, defaultVehicle: value });
        setUserPrefDocId(newDoc.id);
      }
      setVehicleType(value);
    } catch (error) {
      Alert.alert("Error", "Could not save vehicle preference.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#6a65fb" />
          <Text style={styles.backText}>Account</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>My Vehicle</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.subContent}>
        <Text style={styles.sectionLabel}>Vehicle Type</Text>
        <Text style={styles.helperText}>Select your vehicle type to help filter spots easier</Text>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <View style={{ flexDirection: "column", gap: 12, marginTop: 8 }}>
            {VEHICLE_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => handleSelect(v)}
                disabled={saving}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: vehicleType === v ? "#6a65fb" : "#ccc",
                  backgroundColor: vehicleType === v ? "#ede9ff" : "#fff",
                  width: "100%",
                }}
              >
                <Text style={{ fontWeight: "600", color: vehicleType === v ? "#6a65fb" : "#333" }}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {saving && <ActivityIndicator style={{ marginTop: 16 }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-screen: Map Preference

function MapPreferenceScreen({ onBack }) {
  const [mapPreference, setMapPreference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const stored = await AsyncStorage.getItem("mapPreference");
        if (stored) setMapPreference(stored);
      } catch (error) {
        console.error("Error loading map preference:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSelect(value) {
    try {
      await AsyncStorage.setItem("mapPreference", value);
      setMapPreference(value);
    } catch (error) {
      Alert.alert("Error", "Could not save map preference.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#6a65fb" />
          <Text style={styles.backText}>Account</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Map Preference</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.subContent}>
        <Text style={styles.sectionLabel}>Navigation App</Text>
        <Text style={styles.helperText}>Choose which map app opens when getting directions</Text>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <View style={{ gap: 12, marginTop: 8 }}>
            {MAP_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: mapPreference === option.value ? "#6a65fb" : "#ccc",
                  backgroundColor: mapPreference === option.value ? "#ede9ff" : "#fff",
                }}
              >
                <Ionicons
                  name="map-outline"
                  size={20}
                  color={mapPreference === option.value ? "#6a65fb" : "#999"}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ fontWeight: "600", fontSize: 16, color: mapPreference === option.value ? "#6a65fb" : "#333" }}>
                  {option.label}
                </Text>
                {mapPreference === option.value && (
                  <Ionicons name="checkmark" size={20} color="#6a65fb" style={{ marginLeft: "auto" }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Main Settings Screen

export default function SettingsScreen() {
  const [view, setView] = useState("main"); // "main" | "personalInfo" | "security" | "vehicle" | "mapPreference"
  const user = firebase_auth.currentUser;

  if (view === "personalInfo") {
    return <PersonalInfoScreen onBack={() => setView("main")} />;
  }
  if (view === "security") {
    return <SecurityScreen onBack={() => setView("main")} />;
  }
  if (view === "vehicle") {
    return <VehicleScreen onBack={() => setView("main")} />;
  }
  if (view === "mapPreference") {
    return <MapPreferenceScreen onBack={() => setView("main")} />;
  }

  const initials = getInitials(user);
  const displayName = user?.displayName ?? "User";
  const email = user?.email ?? "";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.mainContent}>
        <Text style={styles.pageTitle}>Your Account</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
        </View>

        {/* Account rows */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.row, styles.rowBorderBottom]}
            onPress={() => setView("personalInfo")}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="person-outline" size={20} color="#6a65fb" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Personal Info</Text>
              <Text style={styles.rowSubtitle}>Name, Email</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => setView("security")}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="lock-closed-outline" size={20} color="#6a65fb" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Security</Text>
              <Text style={styles.rowSubtitle}>Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Preferences rows */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.row, styles.rowBorderBottom]}
            onPress={() => setView("vehicle")}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="car-outline" size={20} color="#6a65fb" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>My Vehicle</Text>
              <Text style={styles.rowSubtitle}>SUV, Sedan, Pick-up, Van</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => setView("mapPreference")}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="map-outline" size={20} color="#6a65fb" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Map Preference</Text>
              <Text style={styles.rowSubtitle}>Google Maps, Apple Maps</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => firebase_auth.signOut()}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="log-out-outline" size={20} color="#6a65fb" />
            </View>
            <Text style={styles.rowTitle}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
