import { AsyncStorage } from "react-native";
export const _storeToken = async (props) => {
  try {
    await AsyncStorage.setItem("userToken", props);
  } catch (error) {
    console.log(error);
  }
};

export const _retrieveData = async () => {
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

export const _removeData = async () => {
  try {
    const value = await AsyncStorage.removeItem("userToken");
  } catch (error) {
    console.log(error);
  }
};
