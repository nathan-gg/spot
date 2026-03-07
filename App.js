import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

//import Onboarding Screens ** FILE NAMES TO BE CHANGED
import LoginScreen from "./src/screens/LoginScreen";
import PasswordScreen from "./src/screens/PasswordScreen";
import LocationPermScreen from "./src/screens/LocationPermScreen";

// import Tab Screens ** FILE NAMES TO BE CHANGED
import Tab1Screen from "./src/screens/Tab1Screen";
import Tab2Screen from "./src/screens/Tab2Screen";
import Tab3Screen from "./src/screens/Tab3Screen";
import Tab4Screen from "./src/screens/Tab4Screen";

// import Settings Screen ** FILE NAMES TO BE CHANGED
import SettingsScreen from "./src/screens/SettingsScreen";

// import MapScreen ** FILE NAMES TO BE CHANGED
import MapScreen from "./src/screens/MapScreen";
import SavedScreen from "./src/screens/SavedScreen.js";
import HomeScreen from "./src/screens/HomeScreen.js";

//navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

//Functions (Each Tab has its own stack within!) ** DUE TO CHANGE
// ATM The SettingsScreen can be accessed from each tab just as place holders
function Tab1Stack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tab 1" component={Tab1Screen} />
      {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
  );
}

function Tab2Stack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tab 2" component={Tab2Screen} />
      {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
  );
}

function Tab3Stack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tab 3" component={Tab3Screen} />
      {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
  );
}

function Tab4Stack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tab 4" component={Tab4Screen} />
      {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
  );
}

//Main Navigation Bar at Bottom, holding all Tabs
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
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
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Password"
          component={PasswordScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="LocationPerm"
          component={LocationPermScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
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
