import * as React from "react";
import { Text, View, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { _removeData, _retrieveData, _storeData } from "./Storage.js";
import { reducerFunc, defaultState } from "./Reducer.js";
import { SignInScreen, SignUpScreen } from "./SigningScreens.js";
import { AuthContext } from "./Context.js";
import { HomeScreen } from "./HomeScreen.js";
import { _signOut } from "./Signing.js";

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
    const bootstrapAsync = async () => {
      let userToken = _retrieveData("userToken");

      // After restoring token, we may need to validate it in production apps

      dispatch({ type: "RESTORE_TOKEN", token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (data) => {
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
                _storeData("userToken", text);
                _storeData("username", data.username);
              }
            })
          )
          .catch((error) => {
            alert();
            console.error(error);
          });
      },
      signOut: async (data) => {
        _removeData("username");
        _removeData("userToken");
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
        const userToken = await _retrieveData("userToken");
        const username = await _retrieveData("username");

        let xp = fetch("http://192.168.1.7:8000/get_xp?username=" + username, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + userToken,
          },
        })
          .then((response) =>
            response
              .text()
              .then((text) =>
                Alert.alert(
                  "Experience",
                  "Your current experience points: " + text,
                  [{ text: "OK" }],
                  { cancelable: false }
                )
              )
          )
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
            <Stack.Screen name="Splash" component={SplashScreen} />
          ) : state.userToken === null ? (
            <>
              <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{
                  title: "Sign in",
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
            <Stack.Screen name="Home" component={HomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
