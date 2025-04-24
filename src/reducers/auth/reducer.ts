import { SET_CURRENT_USER } from "./constants";
import { AnyAction } from "redux"; // thêm import này

type authState = {
    currentUser: object | null;
};

const initState: authState = {
    currentUser: null,
};

export const reducer = (state = initState, action: AnyAction) => {
    switch (action.type) {
        case SET_CURRENT_USER:
            return {
                ...state,
                currentUser: action.payload
            };
        default:
            return state;
    }
}
