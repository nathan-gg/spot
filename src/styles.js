import { StyleSheet } from "react-native";

export const PURPLE = "#5C5CE0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  title: {
    marginTop: 10,
    padding: 5,
    fontWeight: "bold",
    fontSize: 20,
  },
  map: {
    width: "100%",
    height: "80%",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "black",
    padding: 5,
    borderRadius: 5,
    margin: 10,
  },
  searchRow: {
    flexDirection: "row",
  },
  buttonView: {
    margin: 10,
  },
  mapMarker: {},
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
