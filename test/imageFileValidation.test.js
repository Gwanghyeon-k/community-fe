import test from 'node:test';
import assert from 'node:assert/strict';

import { validateImageFile } from '../utils/imageFileValidation.js';

test('allows backend-supported image extensions up to 10MB', () => {
    const file = new File(['image'], 'post.webp', { type: 'image/webp' });

    assert.deepEqual(validateImageFile(file), { ok: true, message: '' });
});

test('rejects unsupported image extensions before upload', () => {
    const file = new File(['image'], 'post.heic', { type: 'image/heic' });

    assert.equal(validateImageFile(file).ok, false);
});

test('rejects files larger than 10MB before upload', () => {
    const file = { name: 'post.png', size: 10 * 1024 * 1024 + 1 };

    assert.equal(validateImageFile(file).ok, false);
});
