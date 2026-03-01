import { View, Text } from "react-native";

export default function Tab1Screen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#a1ff96",
      }}
    >
      <Text>Tab 1</Text>
      {/* <TouchableOpacity onPress={() => navigation.navigate("Settings")}> */}
      {/* <Text>Go to Settings</Text> */}
      {/* </TouchableOpacity> */}
    </View>
  );
}
