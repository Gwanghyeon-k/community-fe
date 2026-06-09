import test from 'node:test';
import assert from 'node:assert/strict';

import { clearAuth, getServerUrl, requestJson, setAuth } from '../utils/request.js';

const jsonResponse = (body, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

test('requestJson maps ApiResponse result to data', async () => {
    globalThis.fetch = async () =>
        jsonResponse({ code: 'COMMON_200', result: { postId: 1 } });

    const result = await requestJson('http://localhost:8080/posts/1');

    assert.equal(result.code, 'COMMON_200');
    assert.deepEqual(result.data, { postId: 1 });
});

test('requestJson adds Authorization header from saved token', async () => {
    const calls = [];
    globalThis.fetch = async (url, options) => {
        calls.push(options);
        return jsonResponse({ result: null });
    };

    setAuth({ accessToken: 'abc', userId: 1 });
    await requestJson('http://localhost:8080/posts');

    assert.equal(calls[0].headers.Authorization, 'Bearer abc');
    clearAuth();
});

test('getServerUrl defaults localhost frontend to backend port 8080', () => {
    const originalWindow = globalThis.window;
    globalThis.window = { location: { hostname: 'localhost' }, __APP_CONFIG__: {} };

    assert.equal(getServerUrl(), 'http://localhost:8080');

    globalThis.window = originalWindow;
});
