import { StyleSheet } from "react-native";

// Design Style Library
const PURPLE = "#8581FF";
const DARK_PURPLE = "#554fff";
const GRAY_BG = "#E8E8E8";
const GRAY_TEXT = "#7d7d7d";
const WHITE = "#FFFFFF";
const GREEN = "#31ab31";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
    padding: 0,
  },
  title: {
    marginTop: 10,
    padding: 5,
    fontWeight: "bold",
    fontSize: 20,
  },
  map: {
    width: "100%",
    flex: 1,
  },

  searchWrapper: {
    position: "absolute",
    top: 70,
    left: 20,
    right: 20,
    zIndex: 1,
  },

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
    elevation: 4,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "black",
    fontWeight: "400",
    paddingLeft: 6,
  },
  // Map Markers
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
    fontWeight: "700",
    fontSize: 14,
  },

  //Bottom Sheet (pops up when you tap a parking spot
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
    paddingBottom: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
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
    fontSize: 22,
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
    color: PURPLE,
    fontSize: 20,
    marginRight: 2,
  },

  starEmpty: {
    color: "#D0CFFF",
    fontSize: 20,
    marginRight: 2,
  },

  // ── Buttons ──────────────────────────────────────────────────────────────

  //
  parkButton: {
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

  // ── Legacy — kept so unrelated screens don't break
  // title: {
  //   marginTop: 10,
  //   padding: 5,
  //   fontWeight: "bold",
  //   fontSize: 20,
  // },
  // buttonView: {
  //   margin: 10,
  // },
});

export const signInStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 80,
    alignItems: "stretch",
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: "contain",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    color: "#333",
    marginBottom: 28,
  },
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
    backgroundColor: "#807CFF",
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
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 40,
  },
  progressDot: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ddd",
  },
  progressDotActive: {
    backgroundColor: PURPLE,
  },
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
  signInLink: {
    textAlign: "center",
    color: PURPLE,
    fontSize: 14,
  },
});

export default styles;
