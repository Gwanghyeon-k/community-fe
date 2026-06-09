export const isAlreadyLikedError = ({ status, code }) =>
    status === 409 &&
    ['POST_LIKE_409', 'POST_LIKE_ALREADY_EXISTS'].includes(code);

export const isLikeNotFoundError = ({ status, code }) =>
    status === 404 &&
    ['POST_LIKE_404', 'POST_LIKE_NOT_FOUND'].includes(code);
