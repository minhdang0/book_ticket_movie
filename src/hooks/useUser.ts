import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

function useUser() {
    const data = useContext(UserContext) ;
    if(!data) return null;
    return data.user;
}

export default useUser;