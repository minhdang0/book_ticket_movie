import authService from "../../services/authService"
import { Dispatch } from "redux"
import { SET_CURRENT_USER } from "./constants"

export const getCurrentUser = () => {
    return async (dispatch: Dispatch) => {
        try {
            const user = await authService.currentUser();
            dispatch(setCurrentUser(user));
        } catch (error) {
            dispatch(setCurrentUser(null))
        }
    }
}

export const setCurrentUser = (payload: object | null) => {
    return {
        type: SET_CURRENT_USER,
        payload
    }
}