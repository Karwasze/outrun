import { _removeData, _storeData } from "./Storage.js";
import { Alert } from "react-native";

const ipAddr = "http://192.168.1.3:8000";

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
  fetch(ipAddr + "/login", {
    method: "POST",
    body: JSON.stringify({
      username: data.username,
      password: data.password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        Alert.alert("Login failed!", "Try again", [{ text: "OK" }], {
          cancelable: false,
        });
      } else {
        response.text().then((text) => {
          dispatch({ type: "SIGN_IN", token: text });
          _storeData("userToken", text);
          _storeData("username", data.username);
        });
      }
    })
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
  if (possibleNullValues.some((field) => field == "")) {
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
  fetch(ipAddr + "/users", {
    method: "POST",
    body: JSON.stringify({
      username: data.username,
      password: data.password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        Alert.alert("Sign up failed!", "Try again", [{ text: "OK" }], {
          cancelable: false,
        });
      } else {
        response.text().then((text) => {
          dispatch({ type: "SIGN_IN", token: text });
          _storeData("userToken", text);
          _storeData("username", data.username);
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
  data.navigation.goBack();
  dispatch({ type: "SIGN_OUT" });
};

export const signOut = (dispatch) => async (data) => {
  _removeData("username");
  _removeData("userToken");
  dispatch({ type: "SIGN_OUT" });
};
