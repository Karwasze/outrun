import React from "react";
import { Alert } from "react-native";
import { _retrieveData } from "./Storage.js";
import * as Location from "expo-location";

export const getXP = () => async (data) => {
  const userToken = await _retrieveData("userToken");
  const username = await _retrieveData("username");

  let xp = fetch("http://192.168.1.7:8000/get_xp?username=" + username, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + userToken,
    },
  })
    .then((response) =>
      response
        .text()
        .then((text) =>
          Alert.alert(
            "Experience",
            "Your current experience points: " + text,
            [{ text: "OK" }],
            { cancelable: false }
          )
        )
    )
    .catch((error) => {
      console.error(error);
    });
};

export const getCoords = (location, setLocation) => async (data) => {
  const userToken = await _retrieveData("userToken");
  (async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
    }
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    let lat = location["coords"]["latitude"];
    let long = location["coords"]["longitude"];

    let poi = fetch(
      "http://192.168.1.7:8000/coords?" +
        new URLSearchParams({
          lat: lat,
          long: long,
          distance: 400,
        }),
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }
    )
      .then((response) =>
        response
          .text()
          .then((text) =>
            Alert.alert("Coords", text, [{ text: "OK" }], { cancelable: false })
          )
      )
      .catch((error) => {
        console.error(error);
      });
  })();
};
