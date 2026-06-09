import { getServerUrl } from '../utils/function.js';
import { getCurrentUserId, requestJson } from '../utils/request.js';

export const changePassword = async password => {
    const userId = getCurrentUserId();
    const result = requestJson(`${getServerUrl()}/users/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password,
        }),
    });
    return result;
};
