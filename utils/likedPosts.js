const STORAGE_KEY_PREFIX = 'likedPostIds';
const memoryStorage = new Map();

const storage = () => {
    const candidate =
        typeof window !== 'undefined' && window.localStorage
            ? window.localStorage
            : globalThis.localStorage;

    try {
        candidate?.getItem(STORAGE_KEY_PREFIX);
        return candidate;
    } catch (error) {
        return null;
    }
};

const keyForUser = userId => `${STORAGE_KEY_PREFIX}:${userId || 'anonymous'}`;

const getItem = key => storage()?.getItem(key) || memoryStorage.get(key) || '[]';

const setItem = (key, value) => {
    const currentStorage = storage();
    if (currentStorage) currentStorage.setItem(key, value);
    else memoryStorage.set(key, value);
};

const getLikedPostIds = userId => {
    try {
        const parsed = JSON.parse(getItem(keyForUser(userId)));
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (error) {
        return [];
    }
};

const setLikedPostIds = (userId, postIds) => {
    setItem(keyForUser(userId), JSON.stringify([...new Set(postIds.map(String))]));
};

export const isPostLiked = (userId, postId) =>
    getLikedPostIds(userId).includes(String(postId));

export const markPostLiked = (userId, postId) => {
    setLikedPostIds(userId, [...getLikedPostIds(userId), String(postId)]);
};

export const unmarkPostLiked = (userId, postId) => {
    setLikedPostIds(
        userId,
        getLikedPostIds(userId).filter(savedPostId => savedPostId !== String(postId)),
    );
};
