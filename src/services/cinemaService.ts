import * as httpRequest from "../utils/api/httpRequests";

const getAllCinemas = async () => {
    const response = await httpRequest.get('/cinemas');
    return response.data;
}

const getCinema = async (id: string) => {
    const response = await httpRequest.get(`/cinemas/${id}`);
    return response.data;
}

const getRoomByCinemaId = async (id: string) => {
    const response = await httpRequest.get(`/cinemas/${id}/rooms`);
    return response.data;
}

const getMovieByCinema = async (cinema_id: string) => {
    const response = await httpRequest.get(`/cinemas/${cinema_id}/movies`);
    return response.data;
}
export default { getAllCinemas, getCinema, getRoomByCinemaId, getMovieByCinema };