import { View, Text, TouchableOpacity } from "react-native";

export default function PasswordScreen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffbb9b",
      }}
    >
      <Text>Skimming Passwords here</Text>
      <TouchableOpacity onPress={() => navigation.navigate("LocationPerm")}>
        <Text>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
