// these are the Firebase functions for creating a new account, and using it to sign in
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
// this gets the firebase authentication instance from the firebaseConfig file within the app
import { firebase_auth } from "../firebaseConfig";

import { signInStyles as styles } from "../styles";

import SpotLogo from "../components/SpotLogo";

// the main function that is exported and used as a screen within App.js
export default function SignInScreen() {
  // a variable to check and update the step of the process that user is on
  const [step, setStep] = useState("email"); // "email" | "password" | "signin"
  // empty fields that are updated by user input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordRules = [
    //checklist of our password requirements
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "One number", test: (p) => /[0-9]/.test(p) },
  ];

  //check if all meet req.
  const allRulesPassed = passwordRules.every((r) => r.test(password));

  // a more concise variable for firebase_auth so that we do not have to copy and paste it everywhere
  const auth = firebase_auth;

  // this is a Javascript regex (regular expression) which we implemented to make sure that users are entering real emails, this helps prevent spamming and bots from making accounts
  // const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    email,
  );

  function getAuthError(code) {
    switch (code) {
      case "auth/email-already-in-use":
        return "That email is already registered. Try signing in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password. Please try again.";
      case "auth/user-not-found":
        return "No account found with that email. Try signing up.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/network-request-failed":
        return "No internet connection. Please check your wifi and try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  // this is the function for when users want to sign up for a new account
  async function handleSignUp() {
    try {
      // this function handles account creation by sending the user's email and password to Firebase
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // if there is an error, such as a repeat email, this will send a message
      alert(getAuthError(error.code));
    }
  }

  // this is the function for when returning users would like to sign in to their account
  async function handleSignIn() {
    try {
      // this function is used to validate the user's email and password fields with Firebase to check if they have a corresponding account
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // if there is an error, such as a repeat email, this will send a message
      alert(getAuthError(error.code));
    }
  }

  // --- Email Step ---
  if (step === "email") {
    return (
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <SpotLogo width={100} height={64} />
        <Text style={styles.tagline}>The smarter way to park.</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email..."
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.continueButton, { opacity: isValidEmail ? 1 : 0.4 }]}
          onPress={() => isValidEmail && setStep("password")}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep("signin")}>
          <Text style={styles.signInLink}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Sign In Step ---
  if (step === "signin") {
    const canSignIn = isValidEmail && password.length > 0;
    return (
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <SpotLogo width={100} height={64} />
        <Text style={styles.tagline}>The smarter way to park.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signUpButton, { opacity: canSignIn ? 1 : 0.4 }]}
          onPress={() => canSignIn && handleSignIn()}
        >
          <Text style={styles.signUpButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => {
            setPassword("");
            setStep("email");
          }}
        >
          <Text style={styles.goBackButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Password Step (Sign Up) ---

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      <SpotLogo width={100} height={64} />
      <Text style={styles.tagline}>The smarter way to park.</Text>

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ marginBottom: 8 }}>
        {passwordRules.map((rule) => {
          const passed = rule.test(password);
          return (
            <Text
              key={rule.label}
              style={{
                color: passed ? "#31ab31" : "#aaa",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              {passed ? "✓" : "○"} {rule.label}
            </Text>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.signUpButton, { opacity: allRulesPassed ? 1 : 0.4 }]}
        onPress={() => allRulesPassed && handleSignUp()}
      >
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => setStep("email")}
      >
        <Text style={styles.goBackButtonText}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
