import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

//firebase user authentication imports
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { firebase_auth } from "./src/firebaseConfig";
import SignInScreen from "./src/screens/SignInScreen";
import MapPreferenceScreen from "./src/screens/MapPreferenceScreen";
import SplashAnimation from "./src/screens/SplashAnimation";

// import Settings Screen ** FILE NAMES TO BE CHANGED
import SettingsScreen from "./src/screens/SettingsScreen";

// import MapScreen ** FILE NAMES TO BE CHANGED
import MapScreen from "./src/screens/MapScreen";
import SavedScreen from "./src/screens/SavedScreen.js";
import { GestureHandlerRootView } from "react-native-gesture-handler";

//navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

//Main Navigation Bar at Bottom, holding all Tabs
function MainTabs() {
  return (
    <Tab.Navigator /* Options and Effects wrote in here - as it applies to all Tabs */
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: "fade" /* fade between tab navigation */,
        tabBarShowLabel: false /* no labels in nav bar */,

        // placeholder boxes, replace with icons later
        tabBarIcon: ({ focused }) => {
          const icons = {
            Map: "map-outline",
            Saved: "bookmark-outline",
            Settings: "person-outline",
          };
          const iconName = icons[route.name] ?? "ellipse-outline";
          return (
            <View
              style={{
                width: 45,
                height: 45,
                borderRadius: 10,
                marginTop: 20,
                backgroundColor: focused ? "#FFFFFF" : "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={iconName}
                size={30}
                color={focused ? "#6a65fb" : "rgba(255, 255, 255, 0.55)"}
              />
            </View>
          );
        },

        // transparent bar
        tabBarStyle: {
          position: "absolute", // floats over screen content
          left: 0,
          right: 0,
          bottom: 30 /* bottom gap */,

          borderRadius: 60,
          height: 60,
          backgroundColor: "rgba(0, 0, 0, 0.65)", // color & transparency
          shadowColor: "#000000",
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          marginHorizontal: 70,
        },
      })}
    >
      {/* Main App Tabs */}
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [mapPreference, setMapPreference] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const ProtectedStack = createNativeStackNavigator();

  useEffect(() => {
    async function checkMapPreference() {
      await AsyncStorage.clear(); // TEMP - remove when done testing*****THIS CLEARS MAP PREFERENC******!!!!!!
      const preference = await AsyncStorage.getItem("mapPreference");
      setMapPreference(preference);
    }
    checkMapPreference();
  }, []);

  function ProtectedLayout() {
    return (
      <ProtectedStack.Navigator>
        {!mapPreference && (
          <ProtectedStack.Screen
            name="MapPreference"
            component={MapPreferenceScreen}
            options={{ headerShown: false }}
          />
        )}
        <ProtectedStack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </ProtectedStack.Navigator>
    );
  }
  // useEffect hook to listen for Firebase authentication state changes.
  // This runs once when the component mounts.
  useEffect(() => {
    // onAuthStateChanged sets up a listener.
    // it triggers whenever the user logs in, logs out, or the token refreshes.
    onAuthStateChanged(firebase_auth, (user) => {
      console.log("user", user);
      // if user is found, 'user' is an object. If logged out, 'user' is null.
      // we update the local state to trigger a re-render of the navigation.
      setUser(user);
    });
  }, []);

  if (showSplash) {
    return <SplashAnimation onFinish={() => setShowSplash(false)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {/* <Stack.Navigator initialRouteName="SignIn"></Stack.Navigator> */}
        <Stack.Navigator>
          {user ? (
            // IF LOGGED IN: render the Protected Layout.
            // we hide the header here because the ProtectedLayout has its own headers.
            <Stack.Screen
              name="ProtectedArea"
              component={ProtectedLayout}
              options={{ headerShown: false }}
            />
          ) : (
            // IF NOT LOGGED IN: render the Sign In Screen.
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e42525",
    alignItems: "center",
    justifyContent: "center",
  },
});
