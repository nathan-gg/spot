import MapScreen from "./src/screens/MapScreen";

<<<<<<< Updated upstream
=======
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
    <Tab.Navigator>
      <Tab.Screen
        name="1"
        component={Tab1Stack}
        options={{ headerShown: false }}
      />
      {/* <Tab.Screen
        name="2"
        component={Tab2Stack}
        options={{ headerShown: false }}
      /> */}
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="3"
        component={Tab3Stack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="4"
        component={Tab4Stack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
>>>>>>> Stashed changes

export default function App() {
  return <MapScreen />;
}
<<<<<<< Updated upstream
=======

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e42525",
    alignItems: "center",
    justifyContent: "center",
  },
});

// THIS IS THE FUNCTION TO SHOW THE MAP SCREEN

// export default function App() {
//   return <MapScreen />;
// }
>>>>>>> Stashed changes
