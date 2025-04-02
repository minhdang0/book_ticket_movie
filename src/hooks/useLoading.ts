import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

function useLoading() {
    const data = useContext(UserContext) ;
    if(!data) return null;
    return data.loading;
}

export default useLoading;