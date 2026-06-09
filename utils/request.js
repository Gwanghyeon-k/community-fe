export const parseJsonSafe = async response => {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return null;
    }
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
};

const AUTH_TOKEN_KEY = 'accessToken';
const AUTH_USER_ID_KEY = 'userId';
const memoryStorage = new Map();

const storage = () => {
    const candidate =
        typeof window !== 'undefined' && window.localStorage
            ? window.localStorage
            : globalThis.localStorage;

    try {
        candidate?.getItem(AUTH_TOKEN_KEY);
        return candidate;
    } catch (error) {
        return null;
    }
};

const getStorageItem = key =>
    storage()?.getItem(key) || memoryStorage.get(key) || '';

const setStorageItem = (key, value) => {
    const currentStorage = storage();
    if (currentStorage) currentStorage.setItem(key, value);
    else memoryStorage.set(key, value);
};

const removeStorageItem = key => {
    const currentStorage = storage();
    if (currentStorage) currentStorage.removeItem(key);
    memoryStorage.delete(key);
};

export const getServerUrl = () => {
    const configUrl =
        typeof window !== 'undefined' &&
        window.__APP_CONFIG__ &&
        window.__APP_CONFIG__.API_BASE_URL
            ? String(window.__APP_CONFIG__.API_BASE_URL).trim()
            : '';

    if (configUrl) {
        return configUrl.replace(/\/+$/, '');
    }

    const host =
        typeof window !== 'undefined' && window.location
            ? window.location.hostname
            : 'localhost';

    return host.includes('localhost')
        ? 'http://localhost:8080'
        : `http://${host}:8080`;
};

export const getAccessToken = () => getStorageItem(AUTH_TOKEN_KEY);

export const getCurrentUserId = () => getStorageItem(AUTH_USER_ID_KEY);

export const setAuth = ({ accessToken, userId }) => {
    if (accessToken) setStorageItem(AUTH_TOKEN_KEY, accessToken);
    if (userId !== undefined && userId !== null) {
        setStorageItem(AUTH_USER_ID_KEY, String(userId));
    }
};

export const clearAuth = () => {
    removeStorageItem(AUTH_TOKEN_KEY);
    removeStorageItem(AUTH_USER_ID_KEY);
};

export const requestJson = async (url, options = {}) => {
    const { skipAuth, ...fetchOptions } = options;
    const headers = { ...(fetchOptions.headers || {}) };
    const token = getAccessToken();

    if (!skipAuth && token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });
    const body = await parseJsonSafe(response);
    const data =
        body && Object.prototype.hasOwnProperty.call(body, 'result')
            ? body.result
            : body && Object.prototype.hasOwnProperty.call(body, 'data')
              ? body.data
              : null;

    if (response.status === 401) {
        clearAuth();
    }

    return {
        response,
        ok: response.ok,
        status: response.status,
        code: body && body.code ? body.code : null,
        message: body && body.message ? body.message : null,
        data,
        body,
    };
};
