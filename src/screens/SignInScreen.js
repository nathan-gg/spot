import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firebase_auth } from "../firebaseConfig";
import { signInStyles as styles } from "../styles";

export default function SignInScreen() {
  const [step, setStep] = useState("email"); // "email" | "password" | "signin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = firebase_auth;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSignUp() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleSignIn() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  }

  // --- Email Step ---
  if (step === "email") {
    return (
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
        <Image source={require("../../assets/spotLogo.png")} style={styles.logo} />
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
          <Text style={styles.signInLink}>Already have an account? Sign In</Text>
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
        </View>

        <Image source={require("../../assets/spotLogo.png")} style={styles.logo} />
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

        <TouchableOpacity style={styles.goBackButton} onPress={() => { setPassword(""); setStep("email"); }}>
          <Text style={styles.goBackButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Password Step (Sign Up) ---
  return (
    <LinearGradient
      colors={["#FFFFFF", "rgba(94, 88, 255, 0.15)"]}
      style={styles.container}
    >
      <View style={styles.progressRow}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
      </View>

      <Image source={require("../../assets/spotLogo.png")} style={styles.logo} />
      <Text style={styles.tagline}>The smarter way to park.</Text>

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.goBackButton} onPress={() => setStep("email")}>
        <Text style={styles.goBackButtonText}>← Go Back</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
