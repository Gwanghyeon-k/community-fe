import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const getPosts = (lastPostId = 0, size = 5) => {
    const result = requestJson(
        `${getServerUrl()}/posts?lastPostId=${lastPostId}&size=${size}`,
    );
    return result;
};

export const searchPosts = (keyword, lastPostId = 0, size = 5, sort = 'recent') => {
    return getPosts(lastPostId, size);
};
