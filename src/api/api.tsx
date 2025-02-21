import axiosInstance from "@/src/api/axiosInstance";
import encodeAxiosInstance from "@/src/api/encodeAxiosInstance";
import multipartAxiosInstance from "@/src/api/multipartAxiosInstance";
import {saveToken} from "@/src/services/AuthService";
import {Category, Item, RecommendData} from "@/src/utils/interfaceCase";

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

// 이미지 저장 API
export const saveImage = async (formData: any) => {
    try {
        const response = await axiosInstance.post("/screenshot", JSON.stringify(formData));
        console.log(`[saveImage] status: ${response.status}, `, response.data);
        return response.status;
    } catch (error: any) {
        console.log(`[saveImage error] status: ${error.status}, `, error.response.data.detail);
        return error.status;
    }
};

// 이미지 리스트 불러오기 API
export const getImageList = async (): Promise<Item[] | number | null> => {
    try {
        const response = await axiosInstance.get(`/screenshot?only_unused=false`);
        console.log(`[getImageList] status: ${response.status}, `, response.data);
        if (response.status === 200) {
            return response.data.screenshots;
        } else {
            return null;
        }
    } catch (error: any) {
        console.log(`[getImageList error] status: ${error.status}, `, error.response.data.detail);
        if (error.status === 401) {
            return error.status;
        } else {
            return null;
        }
    }
};

// 이미지 삭제 API
export const deleteImage = async (id: string): Promise<number> => {
    try {
        const response = await axiosInstance.delete(`/screenshot/${id}`);
        console.log(`[deleteImage] status: ${response.status}, `, response.data);
        return response.status;
    } catch (error: any) {
        console.log(`[deleteImage error] status: ${error.status}, `, error.response.data.detail);
        return error.status;
    }
};

// 이미지 불러오기 API
export const getImage = async (id: string): Promise<Item | number | null> => {
    try {
        const response = await axiosInstance.get(`/screenshot/${id}`);
        console.log(`[getImage] status: ${response.status}, `, response.data);
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error: any) {
        console.log(`[getImage error] status: ${error.status}, `, error.response.data.detail);
        if (error.status === 401) {
            return error.status;
        } else {
            return null;
        }
    }
};

// 이미지 수정 API
export const updateImage = async (formData: any) => {
    try {
        const response = await axiosInstance.put(`/screenshot/${formData.id}`, JSON.stringify(formData));
        console.log(`[updateImage] status: ${response.status}, `, response.data);
        return response.status;
    } catch (error: any) {
        console.log(`[updateImage error] status: ${error.status}, `, error.response.data.detail);
        return error.status;
    }
};

// 사용완료/사용완료취소 API
export const isUsedUpdate = async (id: string, is_used: boolean): Promise<boolean | number> => {
    try {
        const response = await axiosInstance.put(`/screenshot/${id}/mark-as-used?used=${is_used}`);
        console.log(`[isUsedUpdate] status: ${response.status}, `, response.data);
        return response.status === 200;
    } catch (error: any) {
        console.log(`[isUsedUpdate error] status: ${error.status}, `, error.response.data.detail);
        if (error.status === 401) {
            return 401;
        } else {
            return false;
        }
    }
};

// 만료/사용완료 데이터 전체 삭제 API
export const deleteAll = async () => {
    try {
        const response = await axiosInstance.post(`/screenshot/delete/outdated`);
        console.log(`[deleteAll] status: ${response.status}, `, response.data);
        return response.status;
    } catch (error: any) {
        console.log(`[deleteAll error] status: ${error.status}, `, error.response.data.detail);
        return error.status;
    }
};

// 음성 검색 API
export const audioSearch = async (formData: any): Promise<Item[] | number | null> => {
    try {
        const response = await multipartAxiosInstance.post(`/screenshot/audiosearch`, formData);
        console.log(`[audioSearch] status: ${response.status}, `, response.data);
        if (response.status === 200) {
            return response.data.screenshots;
        } else {
            return null;
        }
    } catch (error: any) {
        console.log(`[audioSearch error] status: ${error.status}, `, error.response.data.detail);
        if (error.status === 401) {
            return error.status;
        } else {
            return null;
        }
    }
};

// 회원 탈퇴 API
export const deleteUser = async () => {
    try {
        const response = await axiosInstance.delete(`/users`);
        console.log(`[deleteUser] status: ${response.status}, `, response.data);
        return response.status;
    } catch (error: any) {
        console.log(`[deleteUser error] status: ${error.status}, `, error.response.data.detail);
        return error.status;
    }
};

// 쿠폰 추천 API
export const recommendCoupon = async (days: number): Promise<RecommendData[] | number | null> => {
    try {
        const response = await axiosInstance.post(`/recommendations/coupon?days=${days}`);
        console.log(`[recommendCoupon] status: ${response.status}, `, response.data);
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error: any) {
        console.log(`[recommendCoupon error] status: ${error.status}, `, error.response.data.detail);
        if (error.status === 401) {
            return 401;
        } else {
            return null;
        }
    }
};