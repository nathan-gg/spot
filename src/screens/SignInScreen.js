import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { firebase_auth } from "../firebaseConfig";
export default function SignInScreen() {
  // state variables to track email and password inputs.
  // these make the text inputs "Controlled Components" (React manages their values).
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // get the auth instance initialized in firebaseConfig.js
  const auth = firebase_auth;
  // handles User Registration.
  // this creates a new user in Firebase Console -> Authentication tab.
  async function handleSignUp() {
    try {
      // send request to Firebase to create a user.
      // 'await' pauses execution here until Firebase responds.
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log(response);
      alert("Sign up success. User: " + email + " signed up.");
      // note: After successful signup, Firebase automatically signs the user in.
      // the onAuthStateChanged listener in App.js will detect this and navigate.
    } catch (error) {
      // handle errors (e.g., email already in use, weak password).
      console.log(error.message);
      alert(error.message);
    }
  }
  // handles User Login.
  // this checks credentials against existing users in Firebase
  async function handleSignIn() {
    try {
      // send request to Firebase to validate credentials.
      const response = await signInWithEmailAndPassword(auth, email, password);
      //console.log(response);
      alert("User: " + email + " signed in");
      // note: Similar to sign up, a success here triggers App.js to switch screens automatically.
    } catch (error) {
      // handle errors (e.g., wrong password, user not found).
      console.log(error.message);
      alert(error.message);
    }
  }

  async function handleSkip() {
    try {
      await signInWithEmailAndPassword(auth, "nsgebreab@gmail.com", "nathan123");
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome</Text>
      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address" // optimizes keyboard for email entry (@symbol)
        value={email}
        onChangeText={setEmail} // updates state on every keystroke
        autoCapitalize="none" // important! Prevents auto-capitalizing the first letter of emails
      />
      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true} // hides text for security (dots/asterisks)
        value={password}
        onChangeText={setPassword}
      />
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={handleSignUp} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Sign In" onPress={handleSignIn} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Skip (Dev Only)" onPress={handleSkip} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  buttonContainer: {
    padding: 20,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#888",
  },
});
