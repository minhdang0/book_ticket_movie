import * as httpRequest from '../utils/api/httpRequests';

const getAllRooms = async () => {
    const response = await httpRequest.get('/rooms');
    return response.data;
}

const getRoom = async (id: string) => {
    const response = await httpRequest.get(`/rooms/${id}`);
    return response.data;
}

export default { getAllRooms, getRoom };