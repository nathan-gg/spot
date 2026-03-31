import { StyleSheet } from "react-native";

// Design Style Library - assign hex codes to a variable for easy styling
const PURPLE = "#807cff"; //main purple
const DARK_PURPLE = "#554fff"; //darker purple
const GRAY_BG = "#E8E8E8"; //app backgrouns colour
const GRAY_TEXT = "#7d7d7d"; // secondary text: descriptions
const WHITE = "#FFFFFF";
const GREEN = "#31ab31"; //price label colout

const styles = StyleSheet.create({
  //container for Map Screen
  container: {
    flex: 1, // For it to fill the screen
    backgroundColor: GRAY_BG,
    padding: 0, // For Map to fill in the edges
  },
  title: {
    marginTop: 10,
    padding: 5,
    fontWeight: "bold",
    fontSize: 20,
  },
  map: {
    width: "100%", //Map fill the screen from edge to edge
    flex: 1,
  },

  //Search Bar - on MapScreen
  searchWrapper: {
    position: "absolute",
    top: 70, // padding so the bar is not in the dynamic island
    left: 20,
    right: 20,
    zIndex: 1, //Allows the search pill bar to be layered above the map
  },

  // white pill container holds the search input and icon
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  input: {
    //text inside the search bar
    flex: 1,
    fontSize: 15,
    color: "black",
    fontWeight: "400",
    paddingLeft: 6, // allows room search icon
  },
  // Map Markers - White pill with DARK_PURPLE border
  mapMarker: {
    backgroundColor: WHITE,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: DARK_PURPLE,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
  },

  //text inside the marker
  mapMarkerText: {
    color: DARK_PURPLE,
    fontWeight: "700", //bold or even heavy
    fontSize: 14,
  },

  //Bottom Sheet pops/slides up when you tap a parking spot
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 100, //not behind nav bar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  //little grey handle at the top of the sheet
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DEDEDE",
    alignSelf: "center",
    marginBottom: 10,
  },

  //row holding spot name (left) and price (right)
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },

  spotName: {
    fontSize: 18,
    fontWeight: "600",
    color: "black",
    flex: 1,
  },

  //money label
  spotPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: GREEN,
  },

  spotAddressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },

  spotAddress: {
    fontSize: 13,
    color: GRAY_TEXT,
    marginBottom: 2,
  },

  spotDescription: {
    fontSize: 13,
    color: GRAY_TEXT,
    marginBottom: 10,
  },

  //star rating row
  starsRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  starFilled: {
    //filled stars are purple
    color: PURPLE,
    fontSize: 20,
    marginRight: 2,
  },

  starEmpty: {
    //empty stars are faded
    color: "#D0CFFF",
    fontSize: 20,
    marginRight: 2,
  },

  //CTA  Buttons

  parkButton: {
    //Go here
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 16,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
  },

  parkButtonText: {
    color: WHITE,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  //Save Spot button yet to be styled

  closeButton: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 8,
  },

  closeButtonText: {
    color: "#adadce",
    fontSize: 14,
    fontWeight: "500",
  },
});

//Sign In Screen
export const signInStyles = StyleSheet.create({
  // full screen white container
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 80,
    alignItems: "stretch",
  },

  //logo image at the top - above fields
  logo: {
    width: 120,
    height: 60,
    resizeMode: "contain",
    marginBottom: 6,
  },

  //subtitle text below logo image
  tagline: {
    fontSize: 16,
    color: "#333",
    marginBottom: 28,
  },

  //email and password inputs
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },

  continueButton: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },

  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  //the lines indicating the onboarding status
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 40,
  },

  //inactive progress status
  progressDot: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ddd",
  },

  //when during that step
  progressDotActive: {
    backgroundColor: PURPLE,
  },

  //Forgot Password?
  forgotText: {
    color: PURPLE,
    fontSize: 14,
    marginBottom: 20,
  },

  signUpButton: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  signUpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  goBackButton: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  goBackButtonText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "500",
  },

  //Already have an account?
  signInLink: {
    textAlign: "center",
    color: PURPLE,
    fontSize: 14,
  },
});

export const mapPrefStyles = StyleSheet.create({
  mapPrefContainer: {
    flex: 1,
    backgroundColor: WHITE,
    paddingHorizontal: 28,
    paddingTop: 80,
    // alignItems: "center",
  },

  mapPrefImage: {
    width: "100%",
    height: 220,
    marginTop: 40,
    marginBottom: 32,
  },

  mapPrefTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
    textAlign: "center",
  },

  mapPrefBody: {
    fontSize: 15,
    color: "#383838",
    lineHeight: 22,
    marginBottom: 10,
    textAlign: "center",
  },

  mapPrefHint: {
    fontSize: 15,
    color: GRAY_TEXT,
    marginBottom: 36,
    textAlign: "center",
  },

  mapPrefButton: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  mapPrefButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default styles;
