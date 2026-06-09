import { validEmail, validNickname, validPassword } from './function.js';

export const canSubmitSignup = ({
    email,
    password,
    passwordCheck,
    nickname,
    profileImageUrl,
}) =>
    Boolean(
        email &&
            validEmail(email) &&
            password &&
            validPassword(password) &&
            passwordCheck &&
            password === passwordCheck &&
            nickname &&
            validNickname(nickname) &&
            profileImageUrl,
    );
