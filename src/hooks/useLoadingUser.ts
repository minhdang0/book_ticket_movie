// import { store } from "../store";
import { useSelector } from "react-redux";

type currentUserValue = {
    isLoading: boolean
}
type stateValue = {
    auth: currentUserValue;
}


function useLoadingUser() {
    const currentUser = useSelector((state: stateValue) => state.auth.isLoading);
    return currentUser
}

export default useLoadingUser