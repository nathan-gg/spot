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

  autocompleteSuggestionsContainer: {
    // where the autocomplete search suggestions appear
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    position: "absolute",
    top: 70, // padding so the bar is not in the dynamic island
    left: 0,
    right: 0,
    zIndex: 2,
  },

  suggestionText: {
    // the name of each suggestion
    borderBottomColor: "#000",
  },

  radiusFilterWrapper: {
    position: "absolute",
    top: 140, // padding so the bar is not in the dynamic island
    left: 20,
    // right: 20,
    // zIndex: 1, //Allows the search pill bar to be layered above the map
  },

  // white pill container holds the search input and icon
  filterRow: {
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
    // width: 270
    alignSelf: "flex-start",
  },

  filterInput: {
    //text inside the search bar
    // flex: 1,
    fontSize: 15,
    color: "black",
    fontWeight: "400",
    paddingLeft: 6, // allows room search icon
    paddingRight: 3,
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
    paddingBottom: 120, //not behind nav bar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 20,
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
    marginBottom: 8,
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

  bottomSheetSection2: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 8,
  },

  spotAddress: {
    fontSize: 13,
    color: GRAY_TEXT,
    marginBottom: 8,
    maxWidth: 240,
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
    // marginTop: ,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 4,
  },

  closeButtonText: {
    color: "#6e6e6e",
    fontSize: 20,
    fontWeight: "500",
    // paddingVertical: 4
  },

  //Splash Screen
  splashContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  splashLogo: {
    width: 200,
    height: 200,
  },

  resetRotationButton: {
    position: "absolute",
    bottom: 170,
    right: 20,
    zIndex: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
  },
  resetRotationButtonText: {
    color: "#6a65fb",
    fontWeight: 500,
    paddingHorizontal:10,
    fontSize: 12
  },

  userLocationButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
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

// Settings Screen
const SECTION_LABEL_COLOR = "#6D6D72";

export const settingsStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },

  // Main screen
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },

  profileCard: {
    backgroundColor: "#6a65fb",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 28,
    gap: 16,
  },

  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  profileName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  profileEmail: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 2,
  },

  sectionLabel: {
    fontSize: 13,
    color: SECTION_LABEL_COLOR,
    marginBottom: 6,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  rowBorderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },

  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(106,101,251,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  rowText: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  rowSubtitle: {
    fontSize: 13,
    color: GRAY_TEXT,
    marginTop: 1,
  },

  // Sub-screens (Personal Info & Security)
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
    backgroundColor: GRAY_BG,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    width: 90,
  },

  backText: {
    color: "#6a65fb",
    fontSize: 16,
  },

  subHeaderTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },

  subContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },

  fieldInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
  },

  fieldInputBorderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },

  helperText: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginBottom: 6,
    marginLeft: 4,
  },

  saveButton: {
    backgroundColor: "#6a65fb",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#6a65fb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

// Saved Screen

export const savedStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEEEFF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  editButtonActive: {
    backgroundColor: "#EAE9FF",
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 16,
  },

  // Spot Card
  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  // top coloured image-area (no real image, use a purple gradient stand-in)
  cardImageArea: {
    height: 150,
    backgroundColor: "#3B3880",
    justifyContent: "flex-end",
    padding: 14,
  },

  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  cardSpotName: {
    color: WHITE,
    fontSize: 22,
    fontWeight: "700",
  },

  // ↑ ↓ reorder button column — left side of image area (edit mode only)
  reorderButtons: {
    position: "absolute",
    left: 10,
    top: 10,
    gap: 4,
  },

  reorderBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center",
    justifyContent: "center",
  },

  reorderBtnDisabled: {
    opacity: 0.3,
  },

  // red delete badge in top-right corner (edit mode only)
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
  },

  // Card body
  cardBody: {
    padding: 14,
    gap: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  infoText: {
    fontSize: 14,
    color: GRAY_TEXT,
    flex: 1,
  },

  // Buttons
  directionsButton: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },

  directionsButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "600",
  },

  detailsButton: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PURPLE,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 8,
  },

  detailsButtonText: {
    color: PURPLE,
    fontSize: 15,
    fontWeight: "600",
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#555",
  },

  emptySubtext: {
    fontSize: 14,
    color: GRAY_TEXT,
  },
});
