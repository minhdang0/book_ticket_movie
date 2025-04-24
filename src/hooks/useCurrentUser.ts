// import { store } from "../store";
import { useSelector } from "react-redux";
import { IUser } from "../utils/interfaces/user";

type currentUserValue = {
    currentUser: IUser
}
type stateValue = {
    auth: currentUserValue
}

function useCurrentUser() {
    const currentUser = useSelector((state: stateValue) => state.auth.currentUser);
    return currentUser
}

export default useCurrentUser