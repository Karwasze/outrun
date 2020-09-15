import * as React from "react";
import { Button, TextInput, View } from "react-native";
import { AuthContext } from "../services/Context.js";

export function SignUpScreen({ navigation }) {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [repeatPassword, setRepeatPassword] = React.useState("");

  const { signUp } = React.useContext(AuthContext);

  return (
    <View>
      <TextInput
        style={{ height: 50, padding: 10 }}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={{ height: 50, padding: 10 }}
        placeholder="Email (optional)"
        value={email}
        defaultValue={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={{ height: 50, padding: 10 }}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={{ height: 50, padding: 10 }}
        placeholder="Repeat password"
        value={repeatPassword}
        onChangeText={setRepeatPassword}
        secureTextEntry
      />

      <Button
        title="Sign up"
        onPress={() =>
          signUp({ username, email, password, repeatPassword, navigation })
        }
      />
    </View>
  );
}

export function SignInScreen({ navigation }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { signIn } = React.useContext(AuthContext);

  return (
    <View style={{ paddingTop: 20 }}>
      <TextInput
        style={{
          height: 50,
          padding: 10,
        }}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={{ height: 50, padding: 10 }}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign in" onPress={() => signIn({ username, password })} />
      <Button title="Sign up" onPress={() => navigation.navigate("SignUp")} />
    </View>
  );
}
