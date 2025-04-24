import { Dispatch } from "redux";
import { ADD_MOVIE, GET_DETAIL_MOVIE, SET_DETAIL_MOVIE } from "./constants";
import productService from "../../services/productService";
export const addMovie = (payload: object) => {
    return {
        type: ADD_MOVIE,
        payload
    }
}

export const getDetailProduct = (id: number) => {
    return async (dispatch: Dispatch) => {

        dispatch({
            type: GET_DETAIL_MOVIE
        })
        try {
            const movie = productService.getOne(id);
            dispatch(setDetailProduct(movie))
        } catch (error) {
            console.log(error)
        }
    }
}

export const setDetailProduct = (payload: object) => ({
    type: SET_DETAIL_MOVIE,
    payload
})