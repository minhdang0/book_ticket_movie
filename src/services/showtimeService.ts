import * as httpRequest from '../utils/api/httpRequests';

const getAllShowtime = async () => {
    const response = await httpRequest.get('/showtime');
    return response.data;
}

const getShowtime = async (id: string) => {
    const response = await httpRequest.get(`/showtime/${id}`);
    return response.data;
}

const getShowtimeByCinema = async (id: string) => {
    const response = await httpRequest.get(`/cinemas/${id}/showtime`);
    return response.data;
}
export default { getAllShowtime, getShowtime, getShowtimeByCinema };