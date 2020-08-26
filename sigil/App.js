import * as React from "react";
import { AsyncStorage, Text, View, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { _removeData, _retrieveData, _storeToken } from "./Token.js";
import { reducerFunc, defaultState } from "./Reducer.js";
import { SignInScreen, SignUpScreen } from "./SingUp.js";
import { AuthContext } from "./Context.js";

function SplashScreen() {
  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App({ navigation }) {
  const [state, dispatch] = React.useReducer(reducerFunc, defaultState);

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
          Alert.alert(
            "Login failed!",
            "Please enter your credentials",
            [{ text: "OK" }],
            { cancelable: false }
          );
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
                Alert.alert(
                  "Login failed!",
                  "Username or password does not exist",
                  [{ text: "OK" }],
                  { cancelable: false }
                );
              } else {
                dispatch({ type: "SIGN_IN", token: text });
                _storeToken(text);
              }
            })
          )
          .catch((error) => {
            alert();
            console.error(error);
          });
      },
      signOut: async (data) => {
        _removeData();
        dispatch({ type: "SIGN_OUT" });
      },

      signUp: async (data) => {
        const possibleNullValues = [
          data.username,
          data.password,
          data.repeatPassword,
        ];
        if (possibleNullValues.some((r) => r == "")) {
          Alert.alert(
            "Register failed!",
            "Fill in required fields",
            [{ text: "OK" }],
            { cancelable: false }
          );
          return;
        }
        if (data.password !== data.repeatPassword) {
          Alert.alert(
            "Register failed!",
            "Entered passwords do not match!",
            [{ text: "OK" }],
            { cancelable: false }
          );
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
                Alert.alert(
                  "Register failed!",
                  "User already exists!",
                  [{ text: "OK" }],
                  { cancelable: false }
                );
              } else if (text == "User created") {
                Alert.alert(
                  "Register failed!",
                  "User created",
                  [{ text: "OK" }],
                  { cancelable: false }
                );
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
