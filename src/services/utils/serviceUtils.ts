import {getAuthToken} from "@/services/authService.ts";

export const createHeaders = async () => {
    const token = await getAuthToken();

    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};