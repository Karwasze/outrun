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
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Email (optional)"
        value={email}
        defaultValue={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
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
    <View>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
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
