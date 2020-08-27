import { _removeData } from "./Storage.js";

export const _signOut = async (data) => {
  _removeData("username");
  _removeData("userToken");
  dispatch({ type: "SIGN_OUT" });
};
