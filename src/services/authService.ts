import * as httpRequest from '../utils/api/httpRequests';

export const currentUser = async ()=> {
    const response = await httpRequest.get('/auth/me');
    return response;
};

export const getUser = async (id:string) => {
    const response = await httpRequest.get(`/users/${id}`);
    return response
}

export const login = async (data:object) => {
    const response = await httpRequest.post('/auth/login', data);
    return response; 
};

export const register = async (data: object) => {
    const response = await httpRequest.post('/auth/register', data);
    return response;
};

export const checkEmail  = async (email: string, excludeId?: string) => {
    const response = await httpRequest.get('/auth/check-email', {
        params: {
            email,
            excludeId
        }
    });
    return response.exists;
}

export const checkPhone = async (phone : string) => {
    const response = await httpRequest.get('/auth/check-phone', {
        params: {
            phone
        }
    }) 
    return response.exists;
}

export const checkUsername = async (username : string) => {
    const response = await httpRequest.get('/auth/check-username' , {
        params :{
            username
        }
    })
    return response.exists;
}

export const updateUser = async (id: string, data:object) => {
    const response = await httpRequest.post(`/users/${id}`, data);
    return response;
}
export default {
    currentUser,
    login,
    register
};
