import * as httpRequest from '../utils/api/httpRequests';

export const getAll = async () => {
    const response = await httpRequest.get('/products');
    return response.data;
}

export const getOne = async (id: number) => {
    const response = await httpRequest.get(`/products/${id}`);
    return response.data;
}

export default {
    getAll,
    getOne
}