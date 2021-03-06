import { Alert } from "react-native";
import { _retrieveData, _removeData, _storeData } from "./Storage.js";
import * as Location from "expo-location";
import { ipAddr } from "./Config.js";

export const getXP = async () => {
  const userToken = await _retrieveData("userToken");
  const username = await _retrieveData("username");
  console.log("GETXP", ipAddr);
  return await fetch(
    ipAddr +
      "/get_xp?" +
      new URLSearchParams({
        username: username,
      }),
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + userToken,
      },
    }
  )
    .then((response) => response.text())
    .catch((error) => {
      console.error(error);
    });
};

export const getCoords = async (location, distance) => {
  const userToken = await _retrieveData("userToken");
  if (distance === "Enter distance (in meters)") {
    alert("Enter correct distance");
    return;
  } else {
    return await fetch(
      ipAddr +
        "/coords?" +
        new URLSearchParams({
          lat: location.lat,
          long: location.long,
          distance: distance,
        }),
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }
    )
      .then((response) =>
        response.text().then((text) => {
          let parsed = JSON.parse(text);
          return parsed;
        })
      )
      .catch((error) => {
        console.error(error);
      });
  }
};

export const updateCoords = async (location) => {
  const username = await _retrieveData("username");
  const userToken = await _retrieveData("userToken");
  return await fetch(
    ipAddr +
      "/update_last_location?" +
      new URLSearchParams({
        username: username,
      }),
    {
      method: "POST",
      body: JSON.stringify(location),
      headers: {
        Authorization: "Bearer " + userToken,
      },
    }
  ).catch((error) => {
    console.error(error);
  });
};

export const resetCoords = async () => {
  let { status } = await Location.requestPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access location was denied");
  }
  let location = await Location.getCurrentPositionAsync({});
  let lat = parseFloat(location["coords"]["latitude"]);
  let long = parseFloat(location["coords"]["longitude"]);
  return { lat, long };
};

export const validateLocation = async (POIparams) => {
  const userToken = await _retrieveData("userToken");
  const username = await _retrieveData("username");

  return await fetch(
    ipAddr +
      "/validate_location?" +
      new URLSearchParams({
        username: username,
      }),
    {
      method: "POST",
      body: JSON.stringify(POIparams),
      headers: {
        Authorization: "Bearer " + userToken,
      },
    }
  )
    .then((response) => {
      if (response.status === 200) {
        return response.text();
      } else if (response.status === 400) {
        Alert.alert(
          "Validation failed",
          "You are too far away. Try moving closer to the point.",
          [{ text: "OK" }],
          {
            cancelable: false,
          }
        );
        return;
      } else {
        Alert.alert(
          "Validation",
          "Error while processing your location, please try again.",
          [{ text: "OK" }],
          {
            cancelable: false,
          }
        );
        return;
      }
    })
    .catch((error) => {
      console.error(error);
    });
};
