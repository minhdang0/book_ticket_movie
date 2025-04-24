import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

function useUser() {
    const data = useContext(UserContext);
    if (!data) {
        throw new Error("Loi");
    }
    return data;
}

export default useUser;