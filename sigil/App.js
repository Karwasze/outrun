import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { _removeData, _retrieveData, _storeData } from "./services/Storage.js";
import { reducerFunc, defaultState } from "./services/Reducer.js";
import { SignInScreen, SignUpScreen } from "./screen/SigningScreens.js";
import { AuthContext } from "./services/Context.js";
import { HomeScreen, SettingsScreen } from "./screen/HomeScreen.js";
import { signOut, signIn, signUp } from "./services/Signing.js";
import { getXP, getCoords } from "./services/Api.js";

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
  const [location, setLocation] = React.useState(null);

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
      signIn: signIn(dispatch),
      signOut: signOut(dispatch),
      signUp: signUp(dispatch),
      getXP: getXP(),
      getCoords: getCoords(location, setLocation),
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
