import React from "react";
import { useAuthContext } from "./useAuthContext";
function useLogout() {
  const { dispatch } = useAuthContext();
  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };
  return { logout };
}

export default useLogout;
