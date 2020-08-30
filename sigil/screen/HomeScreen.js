import * as React from "react";
import {
  Button,
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { AuthContext } from "../services/Context.js";

export function HomeScreen() {
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
