import test from 'node:test';
import assert from 'node:assert/strict';

import {
    isPostLiked,
    markPostLiked,
    unmarkPostLiked,
} from '../utils/likedPosts.js';

test('stores liked posts per user', () => {
    markPostLiked('1', 10);

    assert.equal(isPostLiked('1', 10), true);
    assert.equal(isPostLiked('2', 10), false);
});

test('removes liked post state per user', () => {
    markPostLiked('1', 10);
    unmarkPostLiked('1', 10);

    assert.equal(isPostLiked('1', 10), false);
});
