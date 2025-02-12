import axios from "axios";
import {getToken} from "@/src/services/AuthService";

// Axios 인스턴스 생성
const encodeAxiosInstance = axios.create({
    baseURL: "https://cocorememberme.azurewebsites.net",  // API 서버의 기본 URL
    timeout: 5000,  // 요청 타임아웃 설정 (5초)
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

// 요청 인터셉터 (토큰 추가)
encodeAxiosInstance.interceptors.request.use(
    async (config) => {
        const token = await getToken();  // 저장된 토큰 가져오기
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리)
encodeAxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 토큰 만료 시 로그아웃 처리 등
            console.error("인증 오류: ", error.response.data);
        }
        return Promise.reject(error);
    }
);

export default encodeAxiosInstance;