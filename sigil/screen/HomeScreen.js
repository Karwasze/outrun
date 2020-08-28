import * as React from "react";
import { Button, View, Text } from "react-native";
import { AuthContext } from "../services/Context.js";

export function HomeScreen() {
  const { signOut } = React.useContext(AuthContext);
  const { getXP } = React.useContext(AuthContext);
  const { getCoords } = React.useContext(AuthContext);

  return (
    <View>
      <Text>Signed in!</Text>
      <Button title="Generate new POI" onPress={getCoords} />
      <Button title="Get XP" onPress={getXP} />
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}
