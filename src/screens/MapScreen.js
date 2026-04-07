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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Geocoder from "react-native-geocoding";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Marker, Circle } from "react-native-maps";
import { getParkingData } from "../data/parkingData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons"; // icon library for search icon and bookmark icon

import styles from "../styles"; // import styles from styles.js for consistent design across the app
// import MapPreferenceScreen from "./MapPreferenceScreen";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore"; // Firestore functions to add documents to the database
import { db, firebase_auth } from "../firebaseConfig"; // import the initialized Firebase app and authentication module to interact with Firestore and manage user authentication

import getDistance from "geolib/es/getDistance"; // library to calculate distance between two coordinate points (used for distance filter)
import "react-native-gesture-handler"; // library for gesture handling (used for the bottomSheet for each parking meter)
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, { // used to handle animation styling for gestures
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets"; // use the standalone worklets library

const apiKey = process.env.EXPO_PUBLIC_API_KEY; // store the Google Maps API key in a variable for easy access when initializing the Geocoder and making geocoding requests

// initialize Geocoder on mount with Google Maps API Key
Geocoder.init(apiKey);

export default function App() {
  // main component for the Map Screen, which displays the map, search functionality, and parking spot details
  // console.log("This is the apikey", apiKey);

  // state management
  const [currentLocation, setCurrentLocation] = useState(null); // stores user's GPS coords
  const [searchLocation, setSearchLocation] = useState(""); // stores text from the search input
  const [searchCoordinates, setSearchCoordinates] = useState(null); // store the user's search AFTER it has been changed to coordinates by the Geocoder API so that a marker can be placed on it
  const [parkingSpots, setParkingSpots] = useState([]); // stores current fetched parking spots
  const [filterRadius, setFilterRadius] = useState(""); // stores filter radius input
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]); // stores autocomplete suggestions
  const [isSpotSaved, setIsSpotSaved] = useState(false); // stores a boolean value to know if a spot has already been saved by the user
  const [addressStore, setAddressStore] = useState({}); // stores address objects that hold values for different spots, essentially a cache to prevent fetching the same address multiple times in the same session
  const [selectedParkingSpot, setSelectedParkingSpot] = useState(null);
  const [spotAverageRating, setSpotAverageRating] = useState(0); // average star rating for selected spot
  const [reviewCount, setReviewCount] = useState(0); // total number of ratings for selected spot
  const [spotReviews, setSpotReviews] = useState([]); // all ratings for selected spot
  const [showReviewModal, setShowReviewModal] = useState(false); // controls rate this spot modal
  const [reviewRating, setReviewRating] = useState(0); // star rating user selects (1-5)
  const [showReviewsModal, setShowReviewsModal] = useState(false); // controls see all ratings modal

  // for tracking the location of objects moved by gestures
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 }); // initial value (0,0), where the bottomSheet starts

  const pan = Gesture.Pan() // defining the pan gesture for the map bottomSheet
    .onStart(() => {
      // gesture begins: we capture the starting position of the bottomSheet y axis and save it into context.value
      context.value = { y: translateY.value }; //translateY.value is the current coordinates of the starting point
    })
    .onUpdate((event) => {
      // gesture continues: add the finger's Y axis translation to our starting position
      translateY.value = clamp(context.value.y + event.translationY, 0, 400); // event.translationY: This represents how far the finger has moved since the touch started
    })
    .onEnd(() => {
      // gesture ends: use if-statement to check if the bottomSheet has translated downward at least 250px, if it has then close the bottomSheet
      if (translateY.value > 150) {
        scheduleOnRN(closeSheet); // use scheduleOnRN to call the closeSheet function on the React Native JS thread
      }
      translateY.value = withSpring(5); // withSpring provides a physics-based animation to return the box to starting position if it is moved upward or less than 250px downward
    });

  // animated style is the 'bridge' that maps our numerical Shared Values to the visual transform property of the View.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  function closeSheet() {
    // function that is called to close the bottomSheet by clearing the selectedParkingSpot variable
    setSelectedParkingSpot(null);
  }

  // reference to the MapView component to trigger camera animations
  const mapRef = useRef(null);

  // implement debouncing to prevent the Autocomplete API from being called on every keystroke
  const debounce = (fn) => {
    // take in the function being debounced
    let timeoutId; // holds the ID of the current timer

    return (...args) => {
      // returns a new function that is called everytime debounce is called
      clearTimeout(timeoutId); // clears the current timer and restarts each time a keystroke occurs
      timeoutId = setTimeout(() => {
        fn.apply(this, args); // call performSearch() with the text arguments (what the user inputted in the search bar)
      }, 500); // time interval before performSearch() is called
    };
  };

  // convert the text address in 'searchLocation' into coordinates
  // animate the map to that location
  async function performSearch(searchText) {
    // pass searchText directly to performSearch() to make sure the latest TextInput value is being computed after debouncing occurs
    try {
      // fetch geocoding data from Google
      const json = await Geocoder.from(searchText); // geocoding returns a JSON object with a lot of data, but the important part is the geometry.location object which has the lat and lng coordinates of the searched location, also reading searchText instead of searchLocation to get the live data
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

      setAutocompleteSuggestions([]); // clear the suggestions array once a result is clicked to close the results container
    } catch (error) {
      // catch and log any errors that occur during the geocoding process, such as network issues or invalid addresses
      console.warn("Geocoding Error: ", error); // log the error to the console for debugging purposes
    }
  }

  const debouncedSearch = useRef(debounce(performSearch)).current; // get a debounced version of performSearch that is also using useRef so that it can persist through re-renders (.current is used to access the latest value from useRef)

  const handleSearchChange = (text) => {
    // this handles when the search value changes by updating searchLocation for instant searching with the search button, and debouncedSearch to begin the debouncing process with the current search bar value
    setSearchLocation(text);
    debouncedSearch(text);
  };

  async function getSpotAddress(spot) {
    // function to retrieve the address of a parking spot in readable language for the bottomSheet UI by reverse geocoding the coordinates
    if (addressStore[spot.id]) {
      // check if the spot has already been tapped on and the adress has been saved, this will prevent needing to fetch it from the Geocoding API
      return addressStore[spot.id]; // return fetched address
    }

    try {
      const response = await Geocoder.from(spot.latitude, spot.longitude); // if the spot address has not previously been accessed, retrieve it using Geocoder
      const textAddress = response.results[0].formatted_address; // the address from the Geocoding API is formatted_address

      setAddressStore({ ...addressStore, [spot.id]: textAddress }); // use a spread operator for arrays to add the new address to addressStore so we don't need to fetch next time its clicked
      // console.log(textAddress);
      return textAddress; // return the address to be displayed in the bottomSheet
    } catch (error) {
      console.warn("Reverse Geocoding Error: ", error); // log the error to the console for debugging purposes
      return "Address Not Found"; // return a string to notify the user that the data can't be accessed
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

  // const [modalVisible, setModalVisible] = useState(false);

  async function handleMarkerPress(spot) {
    // when a parking spot marker is pressed, log the details of the selected spot and update the selectedParkingSpot state to the pressed spot, which will trigger the bottom sheet to display with the details of that parking spot
    // console.log("Marker pressed: ", spot);
    // setSelectedParkingSpot(spot); // update state with the selected parking spot, which will trigger the bottom sheet to display with the details of that parking spot
    const address = await getSpotAddress(spot); // calls getSpotAddress when a marker is clicked to retrieve or fetch the formatted address name

    setSelectedParkingSpot({
      // set selectedParkingSpot to store the spot, and add the formatted address to the object using a spread operator
      ...spot,
      address,
    });
    console.log("Marker pressed: ", spot);
    setSelectedParkingSpot(spot); // update state with the selected parking spot, which will trigger the bottom sheet to display with the details of that parking spot
    fetchAverageRating(spot.id); //average rating when spot is selected
  }

  // when looking for info from Firestore, it may take time to get over google, so Firestore sends a "promise" while the answer loads
  // using an async function with await makes it so the function is able to pause until the answer is retrieved, rather than breaking
  async function saveParkingSpot(parkingSpot) {
    try {
      const q = query(
        // create a query to look if the spot has already been saved by the user
        collection(db, "savedParkingSpots"), // specifying collection
        where("userId", "==", firebase_auth.currentUser.uid), // filter by the current user using firebase_auth
        where("id", "==", parkingSpot.id), // filter by the specific spot using the unique parkingSpot.id
      );

      const querySnapshot = await getDocs(q); // take a snapshot of the query and await the data

      setIsSpotSaved(querySnapshot.empty ? false : true); // use a ternary operator to set the boolean value for isSpotSaved, if the querySnapshot is empty then the spot has not been saved already by the user, and vice versa

      if (querySnapshot.empty) {
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
        // should log the id and clear form, but clearing not working?, then shows a native success alert
        console.log("Document written with ID: ", docRef.id);
        Alert.alert(`Spot Saved!`);
      } else {
        // if the spot has already been saved by the user, then when they click on the bookmark the spot should be removed from their saved spots
        const spotAlreadySaved = querySnapshot.docs[0];
        await deleteDoc(doc(db, "savedParkingSpots", spotAlreadySaved.id)); // delete the saved spot document from the firebase collection
        Alert.alert("Spot Removed from Saved");
      }
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
    // function to move the camera to the user's current location
    // console.log(currentLocation);
    try {
      // smoothly move the camera to the new coordinates
      currentLocation && // use short circuting to check if the user's current location can be accessed, if yes then continue with moving the map camera
        mapRef.current?.animateCamera(
          { center: currentLocation.coords, zoom: 15 },
          { duration: 2000 },
        );
    } catch (error) {
      console.warn("Error: ", error);
    }
  }

  async function resetMapRotation() {
    // function to reset the rotation fo the map camera
    // console.log(currentLocation);
    try {
      // reset the map camera's rotation to North using the 'heading' parameter
      mapRef.current?.animateCamera({ heading: 0 });
    } catch (error) {
      console.warn("Error: ", error);
    }
  }

  //gets all ratings for that specific spot then calculates average
  async function fetchAverageRating(spotId) {
    try {
      const q = query(
        collection(db, "reviews"),
        where("spotId", "==", String(spotId)),
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setSpotAverageRating(0);
        setReviewCount(0);
        setSpotReviews([]);
        return;
      }
      const reviews = snapshot.docs.map((doc) => doc.data());
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      setSpotAverageRating(Math.round(total / reviews.length)); //rounds it whole num
      setReviewCount(reviews.length);
      setSpotReviews(reviews);
    } catch (e) {
      console.error("Error fetching ratings", e);
    }
  }

  //review submission function sent to Firestore
  async function submitReview() {
    if (reviewRating === 0) {
      Alert.alert("Please select a star rating before submitting.");
      return;
    }
    try {
      await addDoc(collection(db, "reviews"), {
        spotId: String(selectedParkingSpot.id),
        userId: firebase_auth.currentUser.uid,
        rating: reviewRating,
        dateSaved: new Date(),
      });
      // Alert.alert("Rating submitted!");
      setReviewRating(0);
      setShowReviewModal(false);
      fetchAverageRating(selectedParkingSpot.id);
    } catch (e) {
      console.error("Error submitting rating:", e);
      Alert.alert("Something went wrong. Please try again.");
    }
  }

  function clearSearchLocation() {
    // function to clear search location when the user presses the [X] icon in the search bar
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
            onChangeText={handleSearchChange}
            value={searchLocation}
            placeholder="Find your next destination"
            placeholderTextColor="8A8A8E"
            returnKeyType="search"
            onSubmitEditing={() => performSearch(searchLocation)} // bypass the debouncing process with a direct search using searchLocation
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

                    performSearch(suggestion.description); // go to the destination without needing the user to also click search
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

        {searchCoordinates && Number(filterRadius) > 0 && (
          <Circle
            center={searchCoordinates}
            radius={Number(filterRadius)}
            strokeColor="#554fff"
            strokeWidth={2}
            fillColor="#807cff55"
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
        <Text style={styles.resetRotationButtonText}>N</Text>
        <Ionicons name={"compass-outline"} size={30} color={"#6a65fb"} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.userLocationButton}
        onPress={goToUserLocation}
      >
        <Ionicons name={"locate"} size={30} color={"#6a65fb"} />
      </TouchableOpacity>

      {selectedParkingSpot && (
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.bottomSheet, animatedStyle]}>
            {/* Drag handle */}
            <View style={styles.bottomSheetHandle} />

            {/* Name + Price row */}
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.spotName}>
                Meter #{selectedParkingSpot?.id}
              </Text>
              <Text style={styles.spotPrice}>
                {selectedParkingSpot?.rate}/hr
              </Text>
            </View>

            {/* Address and Save Row */}
            <View style={styles.bottomSheetSection2}>
              <Text style={styles.spotAddress}>
                {selectedParkingSpot?.address}
              </Text>

              {/* Save Button */}
              <TouchableOpacity
                onPress={() => saveParkingSpot(selectedParkingSpot)}
              >
                <Ionicons
                  name={isSpotSaved ? "bookmark-outline" : "bookmark"}
                  size={32}
                  color="#6C63FF"
                />
              </TouchableOpacity>
            </View>

            {/* Averaged Star rating + count */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Text
                    key={i}
                    style={
                      i <= spotAverageRating
                        ? styles.starFilled
                        : styles.starEmpty
                    }
                  >
                    ★
                  </Text>
                ))}
              </View>
              <Text style={{ color: "#7d7d7d", fontSize: 13, marginLeft: 6 }}>
                ({reviewCount} {reviewCount === 1 ? "rating" : "ratings"})
              </Text>
            </View>

            {/* See all rating button */}
            {reviewCount > 0 && (
              <TouchableOpacity
                style={{ marginBottom: 10 }}
                onPress={() => setShowReviewsModal(true)}
              >
                <Text
                  style={{ color: "#807cff", fontSize: 13, fontWeight: "500" }}
                >
                  See all ratings →
                </Text>
              </TouchableOpacity>
            )}

            {/* Rate this spot button */}
            <TouchableOpacity
              style={{ alignItems: "center", marginBottom: 8 }}
              onPress={() => setShowReviewModal(true)}
            >
              <Text
                style={{ color: "#807cff", fontSize: 14, fontWeight: "500" }}
              >
                Rate this Spot ★
              </Text>
            </TouchableOpacity>

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
            {/* <Button
            title="Save Spot"
            onPress={() => saveParkingSpot(selectedParkingSpot)} // when the "Save Spot" button is pressed, call the saveParkingSpot function with the selected parking spot data to save that spot to the user's saved spots list in Firestore, allowing them to view it later in their saved spots screen
          /> */}

            {/* Close */}
            {/* <Pressable
            style={styles.closeButton}
            onPress={() => setSelectedParkingSpot(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable> */}
          </Animated.View>
        </GestureDetector>
      )}

      {/* ── Rate this Spot Modal ── */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6 }}>
              Rate this Spot
            </Text>
            <Text style={{ fontSize: 13, color: "#7d7d7d", marginBottom: 20 }}>
              Tap a star to leave your rating
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} onPress={() => setReviewRating(i)}>
                  <Text
                    style={{
                      fontSize: 48,
                      color: i <= reviewRating ? "#807cff" : "#ddd",
                    }}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: "#807cff",
                borderRadius: 10,
                paddingVertical: 14,
                alignItems: "center",
                marginBottom: 10,
              }}
              onPress={submitReview}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Submit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => {
                setReviewRating(0);
                setShowReviewModal(false);
              }}
            >
              <Text style={{ color: "#aaa", fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── See All Ratings Modal ── */}
      <Modal
        visible={showReviewsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewsModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: "60%",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
              All Ratings
            </Text>
            <Text style={{ fontSize: 13, color: "#7d7d7d", marginBottom: 16 }}>
              {reviewCount} {reviewCount === 1 ? "rating" : "ratings"} ·{" "}
              {spotAverageRating} ★ Avg
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {spotReviews.map((review, index) => (
                <View
                  key={index}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#f0f0f0",
                    paddingVertical: 10,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Text
                        key={i}
                        style={{
                          color: i <= review.rating ? "#807cff" : "#ddd",
                          fontSize: 20,
                        }}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={{ alignItems: "center", paddingTop: 16 }}
              onPress={() => setShowReviewsModal(false)}
            >
              <Text style={{ color: "#aaa", fontSize: 14 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
