import * as Location from "expo-location"; // import expo-location for GPS access
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react"; // useEffect runs code on mount, useRef holds a reference without re-rendering, useState stores reactive values, useMemo caches calculated values for checkDistanceToParkingSpot() to make sure its not needlessly re-rendering, useCallback caches functions so they are not created as new objects on every re-render
import {
  Alert,
  Button,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Geocoder from "react-native-geocoding";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Marker } from "react-native-maps";
import { getParkingData } from "../data/parkingData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons"; // icon library for search icon and bookmark icon

import styles from "../styles"; // import styles from styles.js for consistent design across the app
// import MapPreferenceScreen from "./MapPreferenceScreen";

import { collection, addDoc } from "firebase/firestore"; // Firestore functions to add documents to the database
import { db, firebase_auth } from "../firebaseConfig"; // import the initialized Firebase app and authentication module to interact with Firestore and manage user authentication

import getDistance from "geolib/es/getDistance"; // library to calculate distance between two coordinate points (used for distance filter)

const apiKey = process.env.EXPO_PUBLIC_API_KEY; // store the Google Maps API key in a variable for easy access when initializing the Geocoder and making geocoding requests

// initialize Geocoder on mount with Google Maps API Key
Geocoder.init(apiKey);

export default function App() {
  // main component for the Map Screen, which displays the map, search functionality, and parking spot details
  // console.log("This is the apikey", apiKey);

  // state management
  const [currentLocation, setCurrentLocation] = useState(null); // stores user's GPS coords
  const [searchLocation, setSearchLocation] = useState(null); // stores text from the search input
  const [searchCoordinates, setSearchCoordinates] = useState(null); // store the user's search AFTER it has been changed to coordinates by the Geocoder API so that a marker can be placed on it
  const [parkingSpots, setParkingSpots] = useState([]); // stores current fetched parking spots
  const [filterRadius, setFilterRadius] = useState(""); // stores filter radius input
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]); // stores autocomplete suggestions

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

      setSearchCoordinates({ latitude: lat, longitude: lng }); // set the search coordinates using the latitude and longitude extracted from the geocoding data

      // get data from parkingData.js to put markers on the map for parking spots
      const spots = await getParkingData(lat, lng);
      setParkingSpots(spots); // update state with the retrieved parking spots, which will trigger a re-render and display the markers on the map

      const searchedLocation = {
        // create a region object for the map camera to move to, using the lat and lng from the geocoding response
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
    } catch (error) {
      // catch and log any errors that occur during the geocoding process, such as network issues or invalid addresses
      console.warn("Geocoding Error: ", error); // log the error to the console for debugging purposes
    }
  }

  // useEffect hook: Runs once on mount to request location permissions
  // and fetch the user's current physical position.

  useEffect(() => {
    (async () => {
      // request permission to access device location
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        // if permission is denied, log a message and exit the function to prevent further attempts to access location data
        console.log("Permission to access location was denied");
        return; // exit the function early since we don't have permission to access location, preventing any errors that would occur from trying to access location data without permission
      }

      // get current GPS position
      let location = await Location.getCurrentPositionAsync({});

      if (location) {
        // if location data is successfully retrieved, update currentLocation state with the retrieved location data, which includes the latitude and longitude coordinates of the user's current position
        setCurrentLocation(location);
        // console.log(
        //   `Current location: lat: ${currentLocation.coords.latitude}, lng: ${currentLocation.coords.longitude}`,
        // );
      } else {
        console.log("Current location not obtained");
      }
    })();
  }, []);

  const [selectedParkingSpot, setSelectedParkingSpot] = useState(null); // state to track which parking spot marker has been selected by the user, used to display the bottom sheet with details about the selected parking spot
  // const [modalVisible, setModalVisible] = useState(false);

  function handleMarkerPress(spot) {
    // when a parking spot marker is pressed, log the details of the selected spot and update the selectedParkingSpot state to the pressed spot, which will trigger the bottom sheet to display with the details of that parking spot
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

  async function openMapApplication(latitude, longitude) {
    const preference = await AsyncStorage.getItem("mapPreference");

    if (preference === "google-maps-preference") {
      const url = `comgooglemaps://?daddr=${latitude},${longitude}`;

      const canOpenURL = await Linking.canOpenURL(url);

      if (canOpenURL) {
        Linking.openURL(url);
      } else {
        // otherwise open on the website
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        );
      }
    } else if (preference === "apple-maps-preference") {
      // repeat the process, but if the user has Apple Maps as their preference
      const url = `maps://?daddr=${latitude},${longitude}`;
      const canOpenURL = await Linking.canOpenURL(url);
      if (canOpenURL) {
        Linking.openURL(url);
      } else {
        // fallback if Apple Maps not available (e.g. Android)
        Linking.openURL(
          `https://maps.apple.com/?daddr=${latitude},${longitude}`,
        );
      }
    } else {
      // apply all else to apple maps for now
      Linking.openURL(`maps://?daddr=${latitude},${longitude}`);
    }
  }

  async function goToUserLocation() {
    console.log(currentLocation);

    try {
      // smoothly move the camera to the new coordinates
      currentLocation &&
        mapRef.current?.animateCamera(
          { center: currentLocation.coords, zoom: 15 },
          { duration: 2000 },
        );
    } catch (error) {
      console.warn("Error: ", error);
    }
  }

  async function resetMapRotation() {
    // console.log(currentLocation);

    try {
      // reset the map camera's rotation to North
      mapRef.current?.animateCamera({ heading: 0 });
    } catch (error) {
      console.warn("Error: ", error);
    }
  }

  function clearSearchLocation() {
    setSearchLocation("");
  }

  const checkDistanceToSpot = useCallback(
    (spot) => {
      // useCallback to only check the distance between the searchCoordinates and parkingSpot if the search destination or filter radius value have changed
      console.log("recalculating distance for spot:", spot.id); // for testing that each of the 20 spots are being calculated
      return getDistance(
        { latitude: spot.latitude, longitude: spot.longitude }, // the getDistance function from the geolib library that allows us to calculate distance between two points
        {
          latitude: searchCoordinates.latitude,
          longitude: searchCoordinates.longitude,
        },
      );
    },
    [searchCoordinates],
  ); // dependencies to control when this function is called

  const visibleSpots = useMemo(() => {
    // useMemo to check if values have changed or if they match the already cached values and don't need to be re-rendered
    return parkingSpots.filter(
      (
        spot, // filter to check if the spots shown pass the user distance filter or not
      ) =>
        filterRadius === "" || // if the value in filterRadius is empty (user has not input anything), then show all items
        !searchCoordinates || // checks that the user has actually made a search before trying to filter out spots, otherwise it will crash when it tries to calculate distance to esch spot
        checkDistanceToSpot(spot) <= Number(filterRadius), // call the checkDistanceToSpot function which uses the geolib library to check how far the distance is from the users searchCoords to each parking spot, then filters out the spot if its beyond the user's search radius
    );
  }, [parkingSpots, filterRadius, searchCoordinates]); // dependencies to control when this function is called

  useEffect(() => {
    // function to show autocomplete search results as the user types in their destination using the Google Places API
    if (!searchLocation || searchLocation.length < 3) {
      // check if user has typed anything, if the value is null, or there is only 3 characters in the bar, do not return autocomplete suggestions for places
      setAutocompleteSuggestions([]);
      return;
    }

    const location = currentLocation // this gets the users location so that the autocomplete automatically looks for areas close to the user (in this case Vancouver)
      ? `${currentLocation.coords.latitude},${currentLocation.coords.longitude}` //the ternary operator will first check if the user's location has been retrieved
      : `49.2827,-123.1207`; // if the app can't get the user's location (GPS permissions denied or inactive), just use the default coordinates for Vancouver

    const fetchAutocompleteSuggestions = async () => {
      // fetch autocomplete suggestions and assign the array to this variable (async used because the user may have slow wifi connection or no connection and this will avoid a crash while fetching Places API data)
      try {
        const response = await fetch(
          // fetch the data using the format defined by the Google Places API: 'input' is the the users search (encodeURIComponent() is necessary to encode non-alphanumerical characters into urls like spaces and symbols), 'components:country:ca' is used to limit the autocomplete resuults to Canada, 'location' is set to the user's location or Vancouver, if GPS data is not available, 'radius' is the area of search results in meters (approx 50km between North Vancouver and Canada-US Border so this is sufficient), 'key' is the API key that allows for access to the Google Places API
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchLocation)}&components=country:ca&location=${location}&radius=50000&key=${apiKey}`,
        );
        const data = await response.json(); // await response so that the app doesnt crash while the data is loading
        setAutocompleteSuggestions(data.predictions); // set the autocomplete suggestions to data.predictions, because that is the name which Google structures the JSON object under
      } catch (error) {
        console.warn("Autocomplete suggestions retrieval error:", error); // error message
      }
    };

    fetchAutocompleteSuggestions(); // call the function
  }, [searchLocation]); // add a dependency to the useEffect so that it only runs when searchLocation is updated

  return (
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
          <Ionicons
            name="close"
            size={18}
            color="#8A8A8E"
            style={styles.searchIcon}
            onPress={clearSearchLocation}
          />
        </View>

        {autocompleteSuggestions.length > 0 && ( // check if there are autocomplete suggestions to show, if yes then render this container
          <View style={styles.autocompleteSuggestionsContainer}>
            {autocompleteSuggestions.map(
              (
                suggestion, // use .map() to target each suggestion in the retrieved data array
              ) => (
                <TouchableOpacity
                  key={suggestion.place_id} // use place_id from Google's object data to identify each suggestion result
                  onPress={() => {
                    setSearchLocation(suggestion.description); // set the user's search location to the name of the autocomplete result which is stored in 'description'
                    setAutocompleteSuggestions([]); // clear the suggestions array once a result is clicked to close the results popup
                    performSearch(); // go to the destination without needing the user to also click search
                  }}
                >
                  <Text style={styles.suggestionText}>
                    {/* the name of the autocomplete suggestion */}
                    {suggestion.description}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        )}
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
        // showsMyLocationButton
        showsUserLocation
        rotateEnabled
        provider={PROVIDER_GOOGLE}
      >
        {searchCoordinates && ( // first check if the user has entered searchCoordinates, if yes then make marker, if no then short circuit
          <Marker
            coordinate={searchCoordinates}
            title="Destination"
            description={searchLocation}
            pinColor="red"
          />
        )}
        {visibleSpots.map((parkingSpot) => (
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

      <View style={styles.radiusFilterWrapper}>
        {/* search UI Row */}
        <View style={styles.filterRow}>
          <Ionicons
            name="contract"
            size={18}
            color="#6a65fb"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.filterInput}
            onChangeText={setFilterRadius}
            value={filterRadius}
            placeholder="Set search radius"
            placeholderTextColor="8A8A8E"
            keyboardType="numeric"
            returnKeyType="search"
            // onSubmitEditing={performSearch}
          />
          <Text>meters</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.resetRotationButton}
        onPress={resetMapRotation}
      >
        <Ionicons name={"arrow-up-outline"} size={30} color={"#6a65fb"} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.userLocationButton}
        onPress={goToUserLocation}
      >
        <Ionicons name={"locate"} size={30} color={"#6a65fb"} />
      </TouchableOpacity>

      {selectedParkingSpot && (
        <View style={styles.bottomSheet} pointerEvents="box-none">
          {/* Drag handle */}
          <View style={styles.bottomSheetHandle} />
          {/* Name + Price row */}
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.spotName}>{selectedParkingSpot?.id}</Text>
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
              openMapApplication(
                // when the "Go Here" button is pressed, call the openMapApplication function with the latitude and longitude of the selected parking spot to open the user's preferred map application with directions to that parking spot
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
