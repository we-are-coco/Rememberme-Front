import axiosInstance from "@/src/api/axiosInstance";
import encodeAxiosInstance from "@/src/api/encodeAxiosInstance";
import multipartAxiosInstance from "@/src/api/multipartAxiosInstance";
import {saveToken} from "@/src/services/AuthService";
import {Category, Item} from "@/src/utils/interfaceCase";

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
        console.log(`[register] status: ${response.status}, `, response.data);
        if (response.status === 201) {
            return "success";
        } else {
            return "error";
        }
    } catch (error: any) {
        console.log(`[register error] status: ${error.status}, `, error.response.data.detail);
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

        const response = await encodeAxiosInstance.post('/users/login', data);
        console.log(`[login] status: ${response.status}, `, response.data);
        if (response.status === 200) {
            const {access_token} = response.data;
            await saveToken(access_token);
            return "success";
        } else {
            return "error";
        }
    } catch (error: any) {
        console.log(`[login error] status: ${error.status}, `, error.response.data.detail);
        if (error.status === 422 || error.status === 401) {
            return "fail";
        } else {
            return "error";
        }
    }
};

// 유저 정보 불러오기 API
export const getUser = async () => {
    try {
        const response = await axiosInstance.get('/users/me');
        console.log(`[getUser] status: ${response.status}, `, response.data);
        if (response.status === 200) {
            return response.data;
        } else {
            return "error";
        }
    } catch (error: any) {
        console.log(`[getUser error] status: ${error.status}, `, error.response.data.detail);
        return "error";
    }
};

// 카테고리 리스트 불러오기 API
// @ts-ignore
export const getCategoryList = async (): Promise<Category[] | null> => {
    try {
        const response = await axiosInstance.get('/categories');
        console.log(`[getCategoryList] status: ${response.status}, `, response.data);
        if (response.status === 200) {
            return response.data[1];
        } else {
            return null;
        }
    } catch (error: any) {
        console.log(`[getCategoryList error] status: ${error.status}, `, error.response.data.detail);
        return null;
    }
};

// 이미지 업로드 API
// @ts-ignore
export const uploadImage = async (formData: any): Promise<Item | string | null> => {
    try {
        const response = await multipartAxiosInstance.post("/screenshot/upload", formData);
        console.log(`[uploadImage] status: ${response.status}, `, response.data);
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error: any) {
        console.log(`[uploadImage error] status: ${error.status}, `, error.response.data.detail);
        if (error.status === 401) {
            return error.status.toString();
        } else {
            return null;
        }
    }
};