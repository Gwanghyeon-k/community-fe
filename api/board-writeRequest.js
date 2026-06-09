import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const createPost = boardData => {
    const result = requestJson(`${getServerUrl()}/posts`, {
        method: 'POST',
        body: JSON.stringify(boardData),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return result;
};

export const updatePost = (postId, boardData) => {
    const result = requestJson(`${getServerUrl()}/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify(boardData),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return result;
};

export const fileUpload = formData => {
    const result = requestJson(`${getServerUrl()}/images/postImage`, {
        method: 'POST',
        body: formData,
    });

    return result;
};

export const getBoardItem = postId => {
    const result = requestJson(`${getServerUrl()}/posts/${postId}`, {
        method: 'GET',
    });

    return result;
};
