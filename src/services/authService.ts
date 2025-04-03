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

export const checkEmail  = async (email: string, exclude_id?: string) => {
    const response = await httpRequest.get('/auth/check-email', {
        params: {
            email,
            exclude_id
        }
    });
    return response.exists;
}

export const checkPhone = async (phone : string, exclude_id?: string) => {
    const response = await httpRequest.get('/auth/check-phone', {
        params: {
            phone,
            exclude_id
        }
    }) 
    return response.exists;
}

export const checkUsername = async (username : string, exclude_id?: string) => {
    const response = await httpRequest.get('/auth/check-username' , {
        params :{
            username,
            exclude_id
        }
    })
    return response.exists;
}

export const updateUser = async (id: string, data:object) => {
    const response = await httpRequest.patch(`/users/${id}`, data);
    return response;
}
export default {
    currentUser,
    login,
    register
};
