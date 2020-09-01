import { _removeData, _storeData } from "./Storage.js";
import { Alert } from "react-native";

export const signIn = (dispatch) => async (data) => {
  if (data.username == "" || data.password == "") {
    Alert.alert(
      "Login failed!",
      "Please enter your credentials",
      [{ text: "OK" }],
      { cancelable: false }
    );
    return;
  }
  fetch("http://192.168.1.7:8000/login", {
    method: "POST",
    body: JSON.stringify({
      username: data.username,
      password: data.password,
    }),
  })
    .then((response) =>
      response.text().then((text) => {
        if (text == "Username or password does not exist") {
          Alert.alert(
            "Login failed!",
            "Username or password does not exist",
            [{ text: "OK" }],
            { cancelable: false }
          );
        } else {
          dispatch({ type: "SIGN_IN", token: text });
          _storeData("userToken", text);
          _storeData("username", data.username);
        }
      })
    )
    .catch((error) => {
      alert();
      console.error(error);
    });
};

export const signUp = (dispatch) => async (data) => {
  const possibleNullValues = [
    data.username,
    data.password,
    data.repeatPassword,
  ];
  if (possibleNullValues.some((r) => r == "")) {
    Alert.alert(
      "Register failed!",
      "Fill in required fields",
      [{ text: "OK" }],
      { cancelable: false }
    );
    return;
  }
  if (data.password !== data.repeatPassword) {
    Alert.alert(
      "Register failed!",
      "Entered passwords do not match!",
      [{ text: "OK" }],
      { cancelable: false }
    );
  }
  let token = fetch("http://192.168.1.7:8000/users", {
    method: "POST",
    body: JSON.stringify({
      username: data.username,
      password: data.password,
    }),
  })
    .then((response) =>
      response.text().then((text) => {
        if (text == "User already exists") {
          Alert.alert(
            "Register failed!",
            "User already exists!",
            [{ text: "OK" }],
            { cancelable: false }
          );
        } else if (text == "User created") {
          Alert.alert("Register complete!", "User created", [{ text: "OK" }], {
            cancelable: false,
          });
        } else {
          console.log(text);
        }
      })
    )
    .catch((error) => {
      console.error(error);
    });
  data.navigation.goBack();
  dispatch({ type: "SIGN_OUT" });
};

export const signOut = (dispatch) => async (data) => {
  _removeData("username");
  _removeData("userToken");
  _removeData("XP");
  dispatch({ type: "SIGN_OUT" });
};
