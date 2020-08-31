import * as React from "react";
import {
  Button,
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../services/Context.js";
import { getXP } from "../services/Api.js";
import { _retrieveData, _storeData } from "../services/Storage.js";

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
  const { signOut } = React.useContext(AuthContext);
  const { getXP } = React.useContext(AuthContext);
  const { getCoords } = React.useContext(AuthContext);

  const [value, onChangeText] = React.useState("Enter distance (in meters)");
  const clearTextOnFocus = true;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <Text>Home screen</Text>
        <TextInput
          style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
          onChangeText={(text) => onChangeText(text)}
          value={value}
          keyboardType="numeric"
          clearTextOnFocus={clearTextOnFocus}
        />
        <Button title="Generate new POI" onPress={() => getCoords(value)} />
        <Button title="Get XP" onPress={getXP} />
        <Button title="Sign out" onPress={signOut} />
      </View>
    </TouchableWithoutFeedback>
  );
}

export function SettingsScreen() {
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
    </View>
  );
}
