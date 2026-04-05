import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { firebase_auth } from "../firebaseConfig";
import { settingsStyles as styles } from "../styles";

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

// Main Settings Screen 

export default function SettingsScreen() {
  const [view, setView] = useState("main"); // "main" | "personalInfo" | "security"
  const user = firebase_auth.currentUser;

  if (view === "personalInfo") {
    return <PersonalInfoScreen onBack={() => setView("main")} />;
  }
  if (view === "security") {
    return <SecurityScreen onBack={() => setView("main")} />;
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
