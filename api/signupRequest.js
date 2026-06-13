import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const userSignup = async data => {
    const result = await requestJson(`${getServerUrl()}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        skipAuth: true,
        body: JSON.stringify(data),
    });
    return result;
};

export const checkEmail = async email => {
    return { ok: true, status: 200, data: null };
};

export const checkNickname = async nickname => {
    return { ok: true, status: 200, data: null };
};

export const fileUpload = async file => {
    const result = await requestJson(`${getServerUrl()}/images/userprofiles`, {
        method: 'POST',
        body: file,
    });
    return result;
};
