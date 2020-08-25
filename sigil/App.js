import * as React from "react";
import { AsyncStorage, Button, Text, TextInput, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const AuthContext = React.createContext();

function SplashScreen() {
  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}

function HomeScreen() {
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

function SignUpScreen({ navigation }) {
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

function SignInScreen({ navigation }) {
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

const Stack = createStackNavigator();

export default function App({ navigation }) {
  const _storeToken = async (props) => {
    try {
      await AsyncStorage.setItem("userToken", props);
    } catch (error) {
      console.log(error);
    }
  };

  const _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("userToken");
      if (value !== null) {
        console.log(value);
        return value;
      }
    } catch (error) {
      console.log(value);
    }
  };

  const _removeData = async () => {
    try {
      const value = await AsyncStorage.removeItem("userToken");
    } catch (error) {
      console.log(value);
    }
  };

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case "SIGN_IN":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem("userToken");
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: "RESTORE_TOKEN", token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (data) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        if (data.username == "" || data.password == "") {
          alert("Please enter your credentials");
          return;
        }
        let token = fetch("http://192.168.1.7:8000/login", {
          method: "POST",
          body: JSON.stringify({
            username: data.username,
            password: data.password,
          }),
        })
          .then((response) =>
            response.text().then((text) => {
              if (text == "Username or password does not exist") {
                alert("Username or password does not exist!");
              } else {
                dispatch({ type: "SIGN_IN", token: text });
                _storeToken(text);
              }
            })
          )
          .catch((error) => {
            console.error(error);
          });
      },
      signOut: async (data) => {
        _removeData();
        dispatch({ type: "SIGN_OUT" });
      },

      signUp: async (data) => {
        console.log("here");
        if (data.password !== data.repeatPassword) {
          alert("Entered passwords do not match!");
        }
        let token = fetch("http://192.168.1.7:8000/users", {
          method: "POST",
          body: JSON.stringify({
            username: data.username,
            password: data.password,
          }),
        })
          .then((response) =>
            response.text().then((text) => {
              if (text == "User already exists") {
                alert("User already exists!");
              } else if (text == "User created") {
                alert("User created");
              } else {
                console.log(text);
              }
            })
          )
          .catch((error) => {
            console.error(error);
          });
        data.navigation.goBack();
        dispatch({ type: "SIGN_OUT" });
      },
      getXP: async (data) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token
        const userToken = await _retrieveData();
        // let xp = fetch("http://jsonplaceholder.typicode.com/posts/2", {
        let xp = fetch("http://192.168.1.7:8000/get_xp?username=Karwaszek", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + userToken,
          },
        })
          .then((response) => response.text().then((text) => console.log(text)))
          .catch((error) => {
            console.error(error);
          });
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {state.isLoading ? (
            // We haven't finished checking for the token yet
            <Stack.Screen name="Splash" component={SplashScreen} />
          ) : state.userToken === null ? (
            // No token found, user isn't signed in
            <>
              <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{
                  title: "Sign in",
                  // When logging out, a pop animation feels intuitive
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{
                  title: "Sign Up",
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}
              />
            </>
          ) : (
            // User is signed in
            <Stack.Screen name="Home" component={HomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
