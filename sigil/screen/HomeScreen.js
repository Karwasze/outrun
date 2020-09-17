import * as React from "react";
import {
  Button,
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import MapView from "react-native-maps";
import openMap from "react-native-open-maps";
import Hyperlink from "react-native-hyperlink";
import { AuthContext } from "../services/Context.js";
import { getXP, validateLocation } from "../services/Api.js";
import { _retrieveData, _storeData, _removeData } from "../services/Storage.js";
import { resetCoords, getCoords, updateCoords } from "../services/Api.js";

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: 400,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export function HomeScreen() {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator>
      <Tab.Screen name="Play" component={PlayScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function PlayScreen() {
  const [distance, onChangeText] = React.useState("Enter distance (in meters)");
  const [location, setLocation] = React.useState(null);
  const [POI, setPOI] = React.useState(null);
  const clearTextOnFocus = true;

  React.useEffect(() => {
    const interval = setInterval(async () => {
      setLocation(await resetCoords());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Text>OUTRUN</Text>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.lat,
              longitude: location.long,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
          >
            <MapView.Marker
              coordinate={{ latitude: location.lat, longitude: location.long }}
              title="Your current location"
            />
            {POI ? (
              <MapView.Marker
                coordinate={{
                  latitude: POI.coords.lat,
                  longitude: POI.coords.long,
                }}
                title="Your destination"
                pinColor="#dd1cff"
              />
            ) : (
              <></>
            )}
          </MapView>
        ) : (
          <></>
        )}
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 2, paddingVertical: 20 }}>
          <TextInput
            style={{ height: 40, borderColor: "black", borderWidth: 2 }}
            onChangeText={(text) => onChangeText(text)}
            value={distance}
            keyboardType="numeric"
            clearTextOnFocus={clearTextOnFocus}
          />
          <Button
            title="Generate new POI"
            onPress={async () => {
              Keyboard.dismiss();
              const generatedCoords = await getCoords(location, distance);
              setPOI(generatedCoords);
              updateCoords(generatedCoords);
            }}
          />
          {POI ? (
            <POIComponents
              poi={POI}
              location={location}
              setPOI={setPOI}
            ></POIComponents>
          ) : (
            <></>
          )}
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

export function SettingsScreen() {
  const { signOut } = React.useContext(AuthContext);
  const [XP, setXP] = React.useState("");

  useFocusEffect(() => {
    const bootstrapAsync = async () => {
      let newXP = await getXP().then((text) => text);
      setXP(newXP);
    };
    bootstrapAsync();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Your current xp: {XP}</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}

function POIComponents({ poi, setPOI, location }) {
  const parseValidationResponse = async () => {
    const location_for_request = location;
    location_for_request["distance"] = 0;
    const response = await validateLocation(location_for_request);
    if (response) {
      Alert.alert("Point reached", response, [{ text: "OK" }], {
        cancelable: false,
      });
      setPOI(null);
    }
  };
  return (
    <>
      <Button
        title="Open in Apple Maps"
        onPress={() => {
          openMap({
            latitude: poi.coords.lat,
            longitude: poi.coords.long,
            provider: "apple",
            query: `${poi.coords.lat} , ${poi.coords.long}`,
          });
        }}
      />
      <View
        style={{
          flex: 1,
          paddingVertical: 10,
          alignItems: "center",
        }}
      >
        <Text>Parameters</Text>
        <Text style={{ textAlign: "left" }}>Name: {poi.parameters.name} </Text>
        <Text>Radius: {poi.parameters.radius}m </Text>
        <Text>Power level: {poi.parameters.power}</Text>
        <Text>{poi.parameters.artifact}</Text>
        <Hyperlink linkDefault={true} linkStyle={{ color: "blue" }}>
          <Text>Song: {poi.parameters.song}</Text>
        </Hyperlink>
        <Button
          title="Validate point"
          onPress={async () => await parseValidationResponse()}
        />
      </View>
    </>
  );
}
