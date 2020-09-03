import * as React from "react";
import {
  Button,
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapView from "react-native-maps";
import openMap from "react-native-open-maps";
import { AuthContext } from "../services/Context.js";
import { getXP } from "../services/Api.js";
import { _retrieveData, _storeData } from "../services/Storage.js";
import { resetCoords, getCoords } from "../services/Api.js";

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
  const { getXP } = React.useContext(AuthContext);
  const [distance, onChangeText] = React.useState("Enter distance (in meters)");
  const [location, setLocation] = React.useState({
    lat: 0,
    long: 0,
  });
  const [POI, setPOI] = React.useState(null);
  const clearTextOnFocus = true;

  return (
    <>
      <View style={{ flex: 1 }}>
        <Text>OUTRUN</Text>
        <MapView
          style={styles.map}
          region={{
            latitude: location.lat,
            longitude: location.long,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        >
          {location ? (
            <MapView.Marker
              coordinate={{ latitude: location.lat, longitude: location.long }}
              title="Your current location"
            />
          ) : (
            <></>
          )}
          {POI ? (
            <MapView.Marker
              coordinate={{ latitude: POI.lat, longitude: POI.long }}
              title="Your destination"
              pinColor="#dd1cff"
            />
          ) : (
            <></>
          )}
        </MapView>
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 2 }}>
          <TextInput
            style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
            onChangeText={(text) => onChangeText(text)}
            value={distance}
            keyboardType="numeric"
            clearTextOnFocus={clearTextOnFocus}
          />
          <Button
            title="Reset your location"
            onPress={async () => setLocation(await resetCoords())}
          />
          <Button
            title="Generate new POI"
            onPress={async () => setPOI(await getCoords(location, distance))}
          />
          {POI ? (
            <Button
              title="Open in Apple Maps"
              onPress={() =>
                openMap({
                  latitude: POI.lat,
                  longitude: POI.long,
                  provider: "apple",
                  query: `${POI.lat} , ${POI.long}`,
                })
              }
            />
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

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      _retrieveData("XP").then(async (text) => {
        if (text === undefined) {
          let newXP = await getXP()().then((text) => text);
          _storeData("XP", newXP);
          setXP(newXP);
        } else {
          setXP(text);
        }
      });
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
