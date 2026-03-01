import { View, Text, TouchableOpacity } from "react-native";

export default function LocationPermScreen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffee9b",
      }}
    >
      <Text>Asking for Location Permission</Text>
      <TouchableOpacity onPress={() => navigation.navigate("MainTabs")}>
        <Text>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
