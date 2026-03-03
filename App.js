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

//navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

//Functions (Each Tab has its own stack within!) ** DUE TO CHANGE
// ATM The SettingsScreen can be accessed from each tab just as place holders
function Tab1Stack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tab1" component={Tab1Screen} />
      {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
  );
}

function Tab2Stack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tab2" component={Tab2Screen} />
      {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
  );
}

function Tab3Stack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tab3" component={Tab3Screen} />
      {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
  );
}

function Tab4Stack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tab4" component={Tab4Screen} />
      {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
  );
}

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
          return (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                marginTop: 20,
                backgroundColor: focused
                  ? "rgba(255,255,255,0.9)" // ** active box color
                  : "rgba(255,255,255,0.25)", // ** inactive box color
              }}
            />
          );
        },

        // transparent bar
        tabBarStyle: {
          position: "absolute", // floats over screen content
          bottom: 30 /* bottom gap */,
          marginRight: 25,
          marginLeft: 25,
          borderRadius: 60,
          height: 60,
          backgroundColor: "rgba(0, 0, 0, 0.45)", // color & transparency
          shadowColor: "#000000",
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
      })}
    >
      {/* Tab names are 1 2 3 4 — rename when screens are finalized */}
      <Tab.Screen name="1" component={Tab1Stack} />
      <Tab.Screen name="2" component={Tab2Stack} />
      <Tab.Screen name="3" component={Tab3Stack} />
      <Tab.Screen name="4" component={Tab4Stack} />
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
