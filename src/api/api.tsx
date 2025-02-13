import axiosInstance from "@/src/api/axiosInstance";
import encodeAxiosInstance from "@/src/api/encodeAxiosInstance";
import {saveToken} from "@/src/services/AuthService";

// 테스트 API
export const testHello = async () => {
    try {
        const response = await axiosInstance.get('/');
        return response.data;
    } catch (error: any) {
        alert(error.message);
    }
};

// 회원가입 API
export const register = async (formData: any) => {
    try {
        const response = await axiosInstance.post('/users', {
            email: formData.email,
            name: formData.name,
            password: formData.password,
        });

        if (response.status === 201) {
            return "success";
        } else {
            return "error";
        }
    } catch (error: any) {
        if (error.status === 422) {
            if (error.response.data.detail === "User already exists") {
                return "already";
            } else {
                return "fail";
            }
        } else {
            return "error";
        }
    }
};

// 로그인 API
export const login = async (formData: any) => {
    try {
        const data = {
            username: formData.email,
            password: formData.password,
        };

        alert(data.password);

        const response = await encodeAxiosInstance.post('/users/login', data);

        if (response.status === 200) {
            const {access_token} = response.data;
            await saveToken(access_token);
            return "success";
        } else {
            return "error";
        }
    } catch (error: any) {
        alert(error.response.data.detail[0].type);
        if (error.status === 422 || error.status === 401) {
            return "fail";
        } else {
            return "error";
        }
    }
};