import { AsyncStorage } from "react-native";
export const _storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log(error);
  }
};

export const _retrieveData = async (props) => {
  try {
    const value = await AsyncStorage.getItem(props);
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.log(value);
  }
};

export const _removeData = async (props) => {
  try {
    const value = await AsyncStorage.removeItem(props);
  } catch (error) {
    console.log(error);
  }
};
