const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export const getAllowedImageAccept = () =>
    ALLOWED_EXTENSIONS.map(extension => `.${extension}`).join(',');

export const validateImageFile = file => {
    if (!file) {
        return { ok: false, message: '파일을 선택해주세요.' };
    }

    const extension = String(file.name || '')
        .split('.')
        .pop()
        .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            ok: false,
            message: '이미지는 jpg, jpeg, png, webp 형식만 업로드할 수 있습니다.',
        };
    }

    if (file.size > MAX_IMAGE_SIZE) {
        return {
            ok: false,
            message: '이미지는 10MB 이하만 업로드할 수 있습니다.',
        };
    }

    return { ok: true, message: '' };
};
