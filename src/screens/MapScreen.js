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

import { Ionicons } from "@expo/vector-icons";

import styles from "../styles";
import MapPreferenceScreen from "./MapPreferenceScreen";

import { collection, addDoc } from "firebase/firestore";
import { db, firebase_auth } from "../firebaseConfig";

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

  // when looking for info from Firestore, it may take time to get over google, so Firestore sends a "promise" while the answer loads
  // using an async function with await makes it so the function is able to pause until the answer is retrieved, rather than breaking
  async function saveParkingSpot(parkingSpot) {
    try {
      // add a new "document" (plant) to the plants Firestore collection (database) based on whats currently in the form when "Add Plant is clicked", then Firestore auto generates an id
      const docRef = await addDoc(collection(db, "savedParkingSpots"), {
        userId: firebase_auth.currentUser.uid,
        id: parkingSpot.id,
        type: parkingSpot.type,
        latitude: parkingSpot.latitude,
        longitude: parkingSpot.longitude,
        rate: parkingSpot.rate,
        timeLimit: parkingSpot.timeLimit, // weekday time limit 9am-6pm
        dateSaved: new Date(),
      });
      // should log the id and clear form, but clearing not working?, then shows a native success popup
      console.log("Document written with ID: ", docRef.id);
      Alert.alert(`Spot Saved!`);
    } catch (e) {
      //catch any errors like: no connection to db, no write permissions to db, invalid data, etc
      console.error("Error adding document: ", e);
    }
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
    // <View style={styles.container} pointerEvents="box-none">
    //   <View style={styles.searchWrapper}>
    //     {/* search UI Row */}
    //     <View style={styles.searchRow}>
    //       <Ionicons
    //         name="search"
    //         size={18}
    //         color="#8A8A8E"
    //         style={styles.searchIcon}
    //       />
    //       <TextInput
    //         style={styles.input}
    //         onChangeText={setSearchLocation}
    //         value={searchLocation}
    //         placeholder="Find your next destination"
    //         placeholderTextColor="8A8A8E"
    //         returnKeyType="search"
    //         onSubmitEditing={performSearch}
    //       />
    //     </View>
    //   </View>
    //   {/* Map Component */}
    //   <MapView
    //     style={styles.map}
    //     ref={mapRef}
    //     initialRegion={{
    //       latitude: 49.19418,
    //       longitude: -123.17505,
    //       latitudeDelta: 0.0922,
    //       longitudeDelta: 0.0421,
    //     }}
    //     showsMyLocationButton
    //     showsUserLocation
    //     provider={PROVIDER_GOOGLE}
    //   >
    //     {parkingSpots.map((parkingSpot) => (
    //       <Marker
    //         key={parkingSpot.id}
    //         coordinate={{
    //           latitude: parkingSpot.latitude,
    //           longitude: parkingSpot.longitude,
    //         }}
    //         title={parkingSpot.type}
    //         description={`${parkingSpot.rate} · ${parkingSpot.timeLimit}`}
    //         onPress={() => handleMarkerPress(parkingSpot)}
    //       >
    //         <View style={styles.mapMarker}>
    //           <Text style={styles.mapMarkerText}>{parkingSpot.rate}/hr</Text>
    //         </View>
    //       </Marker>
    //     ))}
    //   </MapView>

    //   {selectedParkingSpot && (
    //     <View style={styles.bottomSheet} pointerEvents="box-none">
    //       {/* Drag handle */}
    //       <View style={styles.bottomSheetHandle} />
    //       {/* Name + Price row */}
    //       <View style={styles.bottomSheetHeader}>
    //         <Text style={styles.spotName}>{selectedParkingSpot?.type}</Text>
    //         <Text style={styles.spotPrice}>{selectedParkingSpot?.rate}/hr</Text>
    //       </View>
    //       {/* address/description data comming soon */}
    //       <Text style={styles.spotAddress}>
    //         {selectedParkingSpot?.address}67 Chud st.
    //       </Text>

    //       <Text style={styles.spotDescription}>
    //         {selectedParkingSpot?.description}the best of the best
    //       </Text>

    //       <Ionicons name="bookmark-outline" size={22} color="#6C63FF" />

    //       {/* Star rating — hardcoded at 4 stars for now, swap with real data later */}
    //       <View style={styles.starsRow}>
    //         {[1, 2, 3, 4].map((i) => (
    //           <Text key={i} style={styles.starFilled}>
    //             ★
    //           </Text>
    //         ))}
    //         <Text style={styles.starEmpty}>★</Text>
    //       </View>

    //       {/* ADD MORE CARD CONTENT HERE (amenities, time limit, etc.) ── */}

    //       {/* Go Here → opens Google Maps or Apple Maps */}
    //       <Pressable
    //         style={styles.parkButton}
    //         onPress={() =>
    //           openMapApplication(
    //             selectedParkingSpot?.latitude,
    //             selectedParkingSpot?.longitude,
    //           )
    //         }
    //         >
    //         <Text style={styles.parkButtonText}>Go Here</Text>
    //       </Pressable>
    //       {/* Close */}
    //       <Pressable
    //         style={styles.closeButton}
    //         onPress={() => setSelectedParkingSpot(null)}
    //       >
    //         <Text style={styles.closeButtonText}>Close</Text>
    //       </Pressable>
    //     <View
    //       style={{
    //         position: "absolute",
    //         bottom: 0,
    //         left: 0,
    //         right: 0,
    //         backgroundColor: "white",
    //         padding: 20,
    //         paddingBottom: 100,
    //         borderTopLeftRadius: 20,
    //         borderTopRightRadius: 20,
    //       }}
    //     >
    //       <Text>{selectedParkingSpot?.rate}/hr</Text>
    //       <Button
    //         title="Go Here"
    //         onPress={() =>
    //           openMapApplication(
    //             selectedParkingSpot?.latitude,
    //             selectedParkingSpot?.longitude,
    //           )
    //         }
    //       >
    //         <Text style={styles.parkButtonText}>Go Here</Text>
    //       </Pressable>
    //       {/* Close */}
    //       <Pressable
    //         style={styles.closeButton}
    //         onPress={() => setSelectedParkingSpot(null)}
    //       >
    //         <Text style={styles.closeButtonText}>Close</Text>
    //       </Pressable>
    //       />
    //       <Button
    //         title="Save Spot"
    //         onPress={() => saveParkingSpot(selectedParkingSpot)}
    //       />

    //     </View>
    //   )}
    // </View>

    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.searchWrapper}>
        {/* search UI Row */}
        <View style={styles.searchRow}>
          <Ionicons
            name="search"
            size={18}
            color="#8A8A8E"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            onChangeText={setSearchLocation}
            value={searchLocation}
            placeholder="Find your next destination"
            placeholderTextColor="8A8A8E"
            returnKeyType="search"
            onSubmitEditing={performSearch}
          />
        </View>
      </View>

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
              <Text style={styles.mapMarkerText}>{parkingSpot.rate}/hr</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedParkingSpot && (
        <View style={styles.bottomSheet} pointerEvents="box-none">
          {/* Drag handle */}
          <View style={styles.bottomSheetHandle} />
          {/* Name + Price row */}
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.spotName}>{selectedParkingSpot?.type}</Text>
            <Text style={styles.spotPrice}>{selectedParkingSpot?.rate}/hr</Text>
          </View>
          {/* address/description data comming soon */}
          <Text style={styles.spotAddress}>
            {selectedParkingSpot?.address}67 Chud st.
          </Text>

          <Text style={styles.spotDescription}>
            {selectedParkingSpot?.description}the best of the best
          </Text>

          <Ionicons name="bookmark-outline" size={22} color="#6C63FF" />

          {/* Star rating — hardcoded at 4 stars for now, swap with real data later */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4].map((i) => (
              <Text key={i} style={styles.starFilled}>
                ★
              </Text>
            ))}
            <Text style={styles.starEmpty}>★</Text>
          </View>

          {/* ADD MORE CARD CONTENT HERE (amenities, time limit, etc.) ── */}

          {/* Go Here → opens Google Maps or Apple Maps */}
          <Pressable
            style={styles.parkButton}
            onPress={() =>
              openMapApplication(
                selectedParkingSpot?.latitude,
                selectedParkingSpot?.longitude,
              )
            }
          >
            <Text style={styles.parkButtonText}>Go Here</Text>
          </Pressable>
          {/* Close */}
          <Pressable
            style={styles.closeButton}
            onPress={() => setSelectedParkingSpot(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
