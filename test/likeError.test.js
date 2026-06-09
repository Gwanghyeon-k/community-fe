import test from 'node:test';
import assert from 'node:assert/strict';

import {
    isAlreadyLikedError,
    isLikeNotFoundError,
} from '../utils/likeError.js';

test('recognizes documented already-liked error codes', () => {
    assert.equal(
        isAlreadyLikedError({ status: 409, code: 'POST_LIKE_409' }),
        true,
    );
    assert.equal(
        isAlreadyLikedError({
            status: 409,
            code: 'POST_LIKE_ALREADY_EXISTS',
        }),
        true,
    );
});

test('recognizes documented like-not-found error codes', () => {
    assert.equal(
        isLikeNotFoundError({ status: 404, code: 'POST_LIKE_404' }),
        true,
    );
    assert.equal(
        isLikeNotFoundError({ status: 404, code: 'POST_LIKE_NOT_FOUND' }),
        true,
    );
});
