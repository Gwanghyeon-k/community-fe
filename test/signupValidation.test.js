import test from 'node:test';
import assert from 'node:assert/strict';

import { canSubmitSignup } from '../utils/signupValidation.js';

const validSignupData = {
    email: 'alice@example.com',
    password: 'Passw0rd!',
    passwordCheck: 'Passw0rd!',
    nickname: 'alice',
    profileImageUrl: 'http://localhost:8080/image/userprofile/a.jpg',
};

test('signup submit remains disabled before profile image upload succeeds', () => {
    assert.equal(canSubmitSignup({ ...validSignupData, profileImageUrl: '' }), false);
});

test('signup submit is enabled when all fields and profile image url are valid', () => {
    assert.equal(canSubmitSignup(validSignupData), true);
});
