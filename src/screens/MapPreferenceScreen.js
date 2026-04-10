import { useState } from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInStyles as s, mapPrefStyles } from "../styles";

export default function MapPreferenceScreen({ navigation }) {
  const [mapPreference, setMapPreference] = useState("");

  async function saveMapPreference(preference) {
    // console.log(preference);
    setMapPreference(preference);
    await AsyncStorage.setItem("mapPreference", preference);
    navigation.replace("MainTabs");
  }

  return (
    <View style={mapPrefStyles.mapPrefContainer}>
      <View style={s.progressRow}>
        <View style={[s.progressDot, s.progressDotActive]} />
        <View style={[s.progressDot, s.progressDotActive]} />
        <View style={[s.progressDot, s.progressDotActive]} />
      </View>

      <Image
        source={require("../../assets/mapPin-icon.png")}
        style={mapPrefStyles.mapPrefImage}
        resizeMode="contain"
      />

      <Text style={mapPrefStyles.mapPrefTitle}>Choose your Map App</Text>
      <Text style={mapPrefStyles.mapPrefBody}>
        When you tap directions to a spot, we'll open them automatically in your
        prefered map app.
      </Text>
      <Text style={mapPrefStyles.mapPrefHint}>
        You can change this anytime in Settings
      </Text>

      <TouchableOpacity
        style={mapPrefStyles.mapPrefButton}
        onPress={() => saveMapPreference("google-maps-preference")}
      >
        <Text style={mapPrefStyles.mapPrefButtonText}>Google Maps</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={mapPrefStyles.mapPrefButton}
        onPress={() => saveMapPreference("apple-maps-preference")}
      >
        <Text style={mapPrefStyles.mapPrefButtonText}>Apple Maps</Text>
      </TouchableOpacity>
    </View>
  );
}
