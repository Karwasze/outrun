import React from "react";
import { Alert } from "react-native";
import { _retrieveData } from "./Storage.js";
import * as Location from "expo-location";

export const getXP = () => async () => {
  const userToken = await _retrieveData("userToken");
  const username = await _retrieveData("username");

  return await fetch("http://192.168.1.7:8000/get_xp?username=" + username, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + userToken,
    },
  })
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
      "http://192.168.1.7:8000/coords?" +
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
          let parsed = JSON.parse(text).coords;
          let lat = parsed.lat;
          let long = parsed.long;
          return { lat, long };
        })
      )
      .catch((error) => {
        console.error(error);
      });
  }
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
