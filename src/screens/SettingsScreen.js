import { Button, StyleSheet, Text, View } from "react-native";
import { firebase_auth } from "../firebaseConfig";

export default function SettingsScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffe371",
      }}
    >
      <Text>This is the Settings Screen</Text>
      <Button onPress={() => firebase_auth.signOut()} title="Sign Out" />
    </View>
  );
}

