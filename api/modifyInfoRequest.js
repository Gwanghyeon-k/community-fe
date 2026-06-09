import { getServerUrl } from '../utils/function.js';
import { getCurrentUserId, requestJson } from '../utils/request.js';

export const userModify = async changeData => {
    const userId = getCurrentUserId();
    const result = await requestJson(`${getServerUrl()}/users/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(changeData),
    });
    return result;
};

export const userDelete = async () => {
    return { ok: false, status: 404, code: 'UNSUPPORTED_BY_API_SPEC' };
};
