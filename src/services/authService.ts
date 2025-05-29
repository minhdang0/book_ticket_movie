import * as httpRequest from '../utils/api/httpRequests';

export const currentUser = async () => {
    const response = await httpRequest.get('/auth/me');
    return response.data;
};
export const getAllUser = async () => {
    const response = await httpRequest.get('/customers');
    return response.data;
}
export const getUser = async (id: string) => {
    const response = await httpRequest.get(`/customers/${id}`);
    return response.data;
}

export const login = async (data: object) => {
    try {
        const response = await httpRequest.post('/auth/login', data);
        return response.data;
    } catch (error) {
        return error
    }
};

export const register = async (data: object) => {
    const response = await httpRequest.post('/auth/register', data);
    return response;
};

export const checkEmail = async (email: string, exclude_id?: string) => {
    const response = await httpRequest.get('/auth/check-email', {
        params: {
            email,
            exclude_id
        }
    });
    return response.data.exists;
}

export const checkPhone = async (phone: string, exclude_id?: string) => {
    const response = await httpRequest.get('/auth/check-phone', {
        params: {
            phone,
            exclude_id
        }
    })
    return response.data.exists;
}

export const checkUsername = async (username: string, exclude_id?: string) => {
    const response = await httpRequest.get('/auth/check-username', {
        params: {
            username,
            exclude_id
        }
    })
    return response.data.exists;
}

export const updateUser = async (id: string, data: object) => {
    const response = await httpRequest.put(`/users/${id}_method=PUT`, data);
    return response;
}
export default {
    currentUser,
    login,
    register,
    getAllUser
};
