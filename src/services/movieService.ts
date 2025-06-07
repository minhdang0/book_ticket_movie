import * as httpRequest from '../utils/api/httpRequests';

const getAllMovies = async () => {
    const response = await httpRequest.get('/movies');
    return response.data;
}

const getMovie = async (id: string) => {
    const response = await httpRequest.get(`/movies/${id}`);
    return response.data;
}

const getMovieBySearch = async (query: string) => {
    const response = await httpRequest.get(`/movies/search/?q=${query}`);
    return response.data
}

export default { getAllMovies, getMovie, getMovieBySearch };