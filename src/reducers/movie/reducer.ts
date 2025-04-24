import { IMovie } from "../../utils/interfaces/movie";
import { ADD_MOVIE } from "./constants";
import { AnyAction } from "redux";

type movieState = {
    movieList: IMovie[];
    detail: object
};

const initState: movieState = {
    movieList: [],
    detail: {}
};

export const reducer = (state = initState, action: AnyAction): movieState => {
    switch (action.type) {
        case ADD_MOVIE:
            return {
                ...state,
                movieList: [...state.movieList, action.payload],
            };
        default:
            return state;
    }
}
