import { Button, StyleSheet, Text, View } from "react-native";
import { firebase_auth } from "../firebaseConfig";
export default function ProtectedAreaScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Protected Screen</Text>
      {/* the Sign Out Button.
When pressed:
1. It calls Firebase's signOut method.
2. This triggers the 'onAuthStateChanged' listener in your App.js.
3. App.js sets 'user' to null.
4. The App component re-renders and automatically switches back to the
SignInScreen.
Note: We don't need to use 'navigation.navigate("SignIn")' here.
The state change handles it automatically!
*/}
      <Button onPress={() => firebase_auth.signOut()} title="Sign Out" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
