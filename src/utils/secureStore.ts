import * as SecureStore from 'expo-secure-store';

/**
 * 데이터를 SecureStore에 저장하는 함수
 * @param key 저장할 키 값
 * @param value 저장할 데이터 (문자열)
 */
export const saveToSecureStore = async (key: string, value: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync(key, value);
        console.log(`[SecureStore] ${key} 저장 완료`);
    } catch (error) {
        console.error(`[SecureStore] ${key} 저장 실패:`, error);
    }
};

/**
 * SecureStore에서 데이터를 가져오는 함수
 * @param key 가져올 키 값
 * @returns 저장된 데이터 (없으면 null 반환)
 */
export const getFromSecureStore = async (key: string): Promise<string | null> => {
    try {
        const value = await SecureStore.getItemAsync(key);
        if (value) {
            console.log(`[SecureStore] ${key} 불러오기 성공`);
            return value;
        } else {
            console.log(`[SecureStore] ${key} 값이 없습니다.`);
            return null;
        }
    } catch (error) {
        console.error(`[SecureStore] ${key} 불러오기 실패:`, error);
        return null;
    }
};

/**
 * SecureStore에서 특정 데이터를 삭제하는 함수
 * @param key 삭제할 키 값
 */
export const deleteFromSecureStore = async (key: string): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(key);
        console.log(`[SecureStore] ${key} 삭제 완료`);
    } catch (error) {
        console.error(`[SecureStore] ${key} 삭제 실패:`, error);
    }
};
