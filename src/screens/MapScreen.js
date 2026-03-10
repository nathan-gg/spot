import * as Location from "expo-location"; // import expo-location for GPS access
import React, { useEffect, useRef, useState } from "react"; // useEffect runs code on mount, useRef holds a reference without re-rendering, useState stores reactive values.
import {
  Alert, // for native popup alerts
  Button, // for native buttons
  Linking, // opens external apps/URLs like google maps
  Modal, // overlay layer (unused)
  Pressable, // touchable area with press feedback
  StyleSheet, // creates style objects (imported but styles come for styles.js)
  Text, // for displaying text
  TextInput, // for user text input
  View, // basic container component
} from "react-native";
import Geocoder from "react-native-geocoding"; // converts text addresses into GPS coordinates using Google Maps API
import MapView, { PROVIDER_GOOGLE } from "react-native-maps"; // map component and Google Maps provider for better performance and features
import { Marker } from "react-native-maps"; // map marker component to display parking spots on the map
import { getParkingData } from "../data/parkingData"; // function to fetch parking spot data based on location
import AsyncStorage from "@react-native-async-storage/async-storage"; // for storing user preferences 
// import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons"; // icon library for search icon and bookmark icon

import styles from "../styles"; // import styles from styles.js for consistent design across the app
// import MapPreferenceScreen from "./MapPreferenceScreen";

import { collection, addDoc } from "firebase/firestore"; // Firestore functions to add documents to the database
import { db, firebase_auth } from "../firebaseConfig"; // import the initialized Firebase app and authentication module to interact with Firestore and manage user authentication


export default function App() { // main component for the Map Screen, which displays the map, search functionality, and parking spot details
  const apiKey = process.env.EXPO_PUBLIC_API_KEY; // store the Google Maps API key in a variable for easy access when initializing the Geocoder and making geocoding requests
  // console.log("This is the apikey", apiKey);

  // state management
  const [currentLocation, setCurrentLocation] = useState(null); // stores user's GPS coords
  const [searchLocation, setSearchLocation] = useState(null); // stores text from the search input
  const [parkingSpots, setParkingSpots] = useState([]); // stores the list of parking spots retrieved from the parkingData.js file based on the searched location

  // initialize Geocoder with Google Maps API Key
  Geocoder.init(apiKey);

  // reference to the MapView component to trigger camera animations
  const mapRef = useRef(null);

  // convert the text address in 'searchLocation' into coordinates
  // animate the map to that location
  async function performSearch() {
    try {
      // fetch geocoding data from Google
      const json = await Geocoder.from(searchLocation); // geocoding returns a JSON object with a lot of data, but the important part is the geometry.location object which has the lat and lng coordinates of the searched location
      const location = json.results[0].geometry.location; // extract the lat and lng from the geocoding response to use for fetching parking data and moving map camera
      const lat = location.lat; // extract latitude from geocoding response
      const lng = location.lng; // extract longitude from geocoding response

      // get data from parkingData.js to put markers on the map for parking spots
      const spots = await getParkingData(lat, lng);
      setParkingSpots(spots); // update state with the retrieved parking spots, which will trigger a re-render and display the markers on the map

      const searchedLocation = { // create a region object for the map camera to move to, using the lat and lng from the geocoding response
        latitude: location.lat, // set the latitude to the lat from geocoding
        longitude: location.lng, // set the longitude to the lng from geocoding

        // Delta values determine the "zoom" spread of the view
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

      // smoothly move the camera to the new coordinates
      mapRef.current?.animateCamera( 
        { center: searchedLocation, zoom: 15 }, // animate the camera to the searched location with a zoom level of 15 for a closer view of the parking spots
        { duration: 2000 }, // set the animation duration to 2000 milliseconds (2 seconds) for a smooth transition to the new location on the map
      );
    } catch (error) { // catch and log any errors that occur during the geocoding process, such as network issues or invalid addresses
      console.warn("Geocoding Error: ", error); // log the error to the console for debugging purposes
    }
  }

  // useEffect hook: Runs once on mount to request location permissions
  // and fetch the user's current physical position.

  useEffect(() => {
    (async () => {
      // request permission to access device location
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") { // if permission is denied, log a message and exit the function to prevent further attempts to access location data
        console.log("Permission to access location was denied"); 
        return; // exit the function early since we don't have permission to access location, preventing any errors that would occur from trying to access location data without permission
      }

      // get current GPS position
      let location = await Location.getCurrentPositionAsync({});

      if (location) { // if location data is successfully retrieved, update currentLocation state with the retrieved location data, which includes the latitude and longitude coordinates of the user's current position
        setCurrentLocation(location);
        console.log(
          `Current location: lat: ${currentLocation.coords.latitude}, lng: ${currentLocation.coords.longitude}`,
        );
      } else {
        console.log("Current location not obtained");
      }
    })();
  }, []);

  const [selectedParkingSpot, setSelectedParkingSpot] = useState(null); // state to track which parking spot marker has been selected by the user, used to display the bottom sheet with details about the selected parking spot
  // const [modalVisible, setModalVisible] = useState(false);

  function handleMarkerPress(spot) { // when a parking spot marker is pressed, log the details of the selected spot and update the selectedParkingSpot state to the pressed spot, which will trigger the bottom sheet to display with the details of that parking spot
    console.log("Marker pressed: ", spot); 
    setSelectedParkingSpot(spot); // update state with the selected parking spot, which will trigger the bottom sheet to display with the details of that parking spot
  }

  // when looking for info from Firestore, it may take time to get over google, so Firestore sends a "promise" while the answer loads
  // using an async function with await makes it so the function is able to pause until the answer is retrieved, rather than breaking
  async function saveParkingSpot(parkingSpot) {
    try {
      // add a new "document" to the Firestore collection (database) based on whats currently in the form when a parking spot is saved, then Firestore auto generates an id
      const docRef = await addDoc(collection(db, "savedParkingSpots"), {
        userId: firebase_auth.currentUser.uid, // associate the saved parking spot with the currently authenticated user by storing their unique user ID from Firebase Authentication, allowing us to later query and display only the parking spots that a specific user has saved
        id: parkingSpot.id, // store the id of the parking spot from the parkingData.js file to identify which spot was saved
        type: parkingSpot.type, // store the type of parking spot (e.g., "Metered", "Free", "Garage") from the parkingData.js file to display in the user's saved spots list and details
        latitude: parkingSpot.latitude, // store the latitude coordinate of the parking spot from the parkingData.js file to display on the map and in details
        longitude: parkingSpot.longitude, // store the longitude coordinate of the parking spot from the parkingData.js file to display on the map and in details
        rate: parkingSpot.rate, // store the hourly rate of the parking spot from the parkingData.js file to display in the user's saved spots list and details
        timeLimit: parkingSpot.timeLimit, // weekday time limit 9am-6pm
        dateSaved: new Date(), // store the date and time when the parking spot was saved to the user's saved spots list, which can be used for sorting and displaying when the spot was saved
      });
      // should log the id and clear form, but clearing not working?, then shows a native success popup
      console.log("Document written with ID: ", docRef.id);
      Alert.alert(`Spot Saved!`);
    } catch (e) {
      //catch any errors like: no connection to db, no write permissions to db, invalid data, etc
      console.error("Error adding document: ", e);
    }
  }

  async function openMapApplication(latitude, longitude) { // when the user taps the "Go Here" button in the bottom sheet, this function is called to open the user's preferred map application (Google Maps or Apple Maps) with directions to the selected parking spot using the latitude and longitude coordinates of that spot
    const preference = await AsyncStorage.getItem("mapPreference"); // retrieve the user's map application preference from AsyncStorage, which was saved when they selected their preferred map app in the MapPreferenceScreen, to determine which map application to open for navigation

    if (preference === "google-maps-preference") { // if the user's preference is Google Maps, construct a URL scheme to open Google Maps with directions to the specified latitude and longitude coordinates of the parking spot, and check if the device can open the URL (i.e., if Google Maps is installed), then open it; if Google Maps is not installed, fall back to opening the directions in the web browser using the Google Maps website
      const url = `comgooglemaps://?daddr=${latitude},${longitude}`; // URL scheme to open Google Maps with directions to the specified latitude and longitude coordinates of the parking spot

      const canOpenURL = await Linking.canOpenURL(url); // check if the device can open the URL (i.e., if Google Maps is installed) to ensure that we don't attempt to open an app that isn't available, which would result in an error; if Google Maps is not installed, we will fall back to opening the directions in the web browser using the Google Maps website

      if (canOpenURL) { // if Google Maps is installed, open the directions in the Google Maps app using the URL scheme with the specified coordinates for the parking spot
        Linking.openURL(url);
      } else {
        // if google maps not installed, open in browser
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        );
      }
    } else {
      // apply all else to apple maps for now
      Linking.openURL(`maps://?daddr=${latitude},${longitude}`); // URL scheme to open Apple Maps with directions to the specified latitude and longitude coordinates of the parking spot; this will work on iOS devices where Apple Maps is the default map application, and if the user has set their preference to Apple Maps in the MapPreferenceScreen, we will attempt to open the directions in Apple Maps using this URL scheme
    }
  }

  return ( // the main return statement of the component, which renders the map, search UI, parking spot markers, and bottom sheet with parking spot details based on the current state of the component
    <View style={styles.container} pointerEvents="box-none"> 
      <View style={styles.searchWrapper}> 
        {/* search UI Row */}
        <View style={styles.searchRow}>
          {/* Icon from react library */}
          <Ionicons
            name="search"
            size={18}
            color="#8A8A8E"
            style={styles.searchIcon}
          />
          <TextInput
          // Text input for the user to type in a location they want to search for parking near, which updates the searchLocation state as they type, and when they submit the search (e.g., by pressing the "search" button on the keyboard), it triggers the performSearch function to geocode the address, fetch parking data, and move the map camera to the searched location
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
      // Map component from react-native-maps that displays the map, user's location, and parking spot markers; it is configured to use Google Maps as the provider for better performance and features, and it is set to show the user's current location with a button to center the map on their location; the mapRef is attached to this component to allow for programmatic control of the camera (e.g., moving to searched locations)
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
        {/* Parking spot markers */}
        {parkingSpots.map((parkingSpot) => (
          <Marker
            key={parkingSpot.id} // use the id from the parkingData.js file as the key for each marker to ensure that each marker has a unique identifier, which is important for performance and correct rendering in React; this id is not related to Firestore but is simply an identifier for the parking spot data being displayed on the map
            coordinate={{ // set the coordinates of the marker to the latitude and longitude of the parking spot from the parkingData.js file to display it in the correct location on the map
              latitude: parkingSpot.latitude,
              longitude: parkingSpot.longitude,
            }}
            title={parkingSpot.type} // set the title of the marker to the type of parking spot (e.g., "Metered", "Free", "Garage") from the parkingData.js file, which will be displayed when the user taps on the marker to provide more information about that parking spot
            description={`${parkingSpot.rate} · ${parkingSpot.timeLimit}`} // set the description of the marker to display the hourly rate and time limit of the parking spot from the parkingData.js file, which will be shown in the callout when the user taps on the marker to provide additional details about that parking spot
            onPress={() => handleMarkerPress(parkingSpot)} // when the marker is pressed, call the handleMarkerPress function with the parking spot data as an argument to update the selectedParkingSpot state and display the bottom sheet with details about that parking spot
          >
            <View style={styles.mapMarker}> 
              {/* Marker content */}
              <Text style={styles.mapMarkerText}>{parkingSpot.rate}/hr</Text> 
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Bottom sheet for selected parking spot */}
      {selectedParkingSpot && (
        <View style={styles.bottomSheet} pointerEvents="box-none">
          {/* Drag handle */}
          <View style={styles.bottomSheetHandle} />
          {/* Name + Price row */}
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.spotName}>{selectedParkingSpot?.type}</Text>
            <Text style={styles.spotPrice}>{selectedParkingSpot?.rate}/hr</Text>
          </View>
          {/* address/description data coming soon */}
          <Text style={styles.spotAddress}>
            {selectedParkingSpot?.address}123 Address St.
          </Text>

          {/* Description */}
          <Text style={styles.spotDescription}>
            {selectedParkingSpot?.description}Vancouver, BC
          </Text>

          {/* Save Button */}
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
              openMapApplication( // when the "Go Here" button is pressed, call the openMapApplication function with the latitude and longitude of the selected parking spot to open the user's preferred map application with directions to that parking spot
                selectedParkingSpot?.latitude,
                selectedParkingSpot?.longitude,
              )
            }
          >
            <Text style={styles.parkButtonText}>Go Here</Text> 
          </Pressable>
          <Button
            title="Save Spot"
            onPress={() => saveParkingSpot(selectedParkingSpot)} // when the "Save Spot" button is pressed, call the saveParkingSpot function with the selected parking spot data to save that spot to the user's saved spots list in Firestore, allowing them to view it later in their saved spots screen
          />

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
