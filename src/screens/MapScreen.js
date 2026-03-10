import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Geocoder from "react-native-geocoding";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Marker } from "react-native-maps";
import { getParkingData } from "../data/parkingData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import styles from "../styles";
import MapPreferenceScreen from "./MapPreferenceScreen";

// tuff

export default function App() {
  const apiKey = process.env.EXPO_PUBLIC_API_KEY;
  // console.log("This is the apikey", apiKey);

  // state management
  const [currentLocation, setCurrentLocation] = useState(null); // stores user's GPS coords
  const [searchLocation, setSearchLocation] = useState(null); // stores text from the search input
  const [parkingSpots, setParkingSpots] = useState([]); //

  // initialize Geocoder with Google Maps API Key
  Geocoder.init(apiKey);

  // reference to the MapView component to trigger camera animations
  const mapRef = useRef(null);

  // convert the text address in 'searchLocation' into coordinates
  // animate the map to that location
  async function performSearch() {
    try {
      // fetch geocoding data from Google
      const json = await Geocoder.from(searchLocation);
      const location = json.results[0].geometry.location;
      const lat = location.lat;
      const lng = location.lng;

      // get data from parkingData.js to put markers on the map for parking spots
      const spots = await getParkingData(lat, lng);
      setParkingSpots(spots);

      const searchedLocation = {
        latitude: location.lat,
        longitude: location.lng,

        // Delta values determine the "zoom" spread of the view
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

      // smoothly move the camera to the new coordinates
      mapRef.current?.animateCamera(
        { center: searchedLocation, zoom: 15 },
        { duration: 2000 },
      );
    } catch (error) {
      console.warn("Geocoding Error: ", error);
    }
  }

  // useEffect hook: Runs once on mount to request location permissions
  // and fetch the user's current physical position.

  useEffect(() => {
    (async () => {
      // request permission to access device location
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      // get current GPS position
      let location = await Location.getCurrentPositionAsync({});

      if (location) {
        setCurrentLocation(location);
        console.log(
          `Current location: lat: ${currentLocation.coords.latitude}, lng: ${currentLocation.coords.longitude}`,
        );
      } else {
        console.log("Current location not obtained");
      }
    })();
  }, []);

  const [selectedParkingSpot, setSelectedParkingSpot] = useState(null);
  // const [modalVisible, setModalVisible] = useState(false);

  function handleMarkerPress(spot) {
    console.log("Marker pressed: ", spot);
    setSelectedParkingSpot(spot);
  }

  async function openMapApplication(latitude, longitude) {
    const preference = await AsyncStorage.getItem("mapPreference");

    if (preference === "google-maps-preference") {
      const url = `comgooglemaps://?daddr=${latitude},${longitude}`;

      const canOpenURL = await Linking.canOpenURL(url);

      if (canOpenURL) {
        Linking.openURL(url);
      } else {
        // if google maps not installed, open in browser
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        );
      }
    } else {
      // apply all else to apple maps for now
      Linking.openURL(`maps://?daddr=${latitude},${longitude}`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter a Location</Text>

      {/* search UI Row */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          onChangeText={setSearchLocation}
          value={searchLocation}
          placeholder="enter location - name or address"
        />
        <View style={styles.buttonView}>
          <Button title="Search" onPress={performSearch} />
        </View>
      </View>

      {/* Map Component */}
      <MapView
        style={styles.map}
        ref={mapRef}
        initialRegion={{
          latitude: 49.19418,
          longitude: -123.17505,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsMyLocationButton
        showsUserLocation
        provider={PROVIDER_GOOGLE}
      >
        {parkingSpots.map((parkingSpot) => (
          <Marker
            key={parkingSpot.id}
            coordinate={{
              latitude: parkingSpot.latitude,
              longitude: parkingSpot.longitude,
            }}
            title={parkingSpot.type}
            description={`${parkingSpot.rate} · ${parkingSpot.timeLimit}`}
            onPress={() => handleMarkerPress(parkingSpot)}
          >
            <View style={styles.mapMarker}>
              <Text>{`${parkingSpot.rate}/hr`}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedParkingSpot && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            padding: 20,
            paddingBottom: 100,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            
          }}
        >
          <Text>{selectedParkingSpot?.rate}/hr</Text>
          <Button
            title="Go Here"
            onPress={() =>
              openMapApplication(
                selectedParkingSpot?.latitude,
                selectedParkingSpot?.longitude,
              )
            }
          />
          <Button title="Close" onPress={() => setSelectedParkingSpot(null)} />
        </View>
      )}
    </View>
  );
}
