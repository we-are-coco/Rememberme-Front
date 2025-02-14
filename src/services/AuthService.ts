import {deleteFromSecureStore, getFromSecureStore, saveToSecureStore} from '../utils/secureStore';

// 토큰 저장
const saveToken = async (token: string) => {
    await saveToSecureStore('userToken', token);
};

// 토큰 가져오기
const getToken = async () => {
    return await getFromSecureStore('userToken');
};

// 토큰 삭제
const removeToken = async () => {
    await deleteFromSecureStore('userToken');
};

export {saveToken, getToken, removeToken};