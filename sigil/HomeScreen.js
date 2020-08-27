import * as React from "react";
import { Button, View, Text } from "react-native";
import { AuthContext } from "./Context.js";

export function HomeScreen() {
  const { signOut } = React.useContext(AuthContext);
  const { getXP } = React.useContext(AuthContext);

  return (
    <View>
      <Text>Signed in!</Text>
      <Button title="Get XP" onPress={getXP} />
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}
