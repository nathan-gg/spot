import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MapPreferenceScreen({ navigation }) {
  const [mapPreference, setMapPreference] = useState("");

  async function saveMapPreference(preference) {
    console.log(preference);
    setMapPreference(preference);
    await AsyncStorage.setItem("mapPreference", preference);
    navigation.replace("MainTabs");
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff9b9b",
      }}
    >
      <Text>Map Preference Screen</Text>
      <TouchableOpacity
        onPress={() => saveMapPreference("google-maps-preference")}
      >
        <Text>Google Maps</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => saveMapPreference("apple-maps-preference")}
      >
        <Text>Apple Maps</Text>
      </TouchableOpacity>
    </View>
  );
}
