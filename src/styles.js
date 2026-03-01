import { StyleSheet } from 'react-native';

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
});

export default styles;