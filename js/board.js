import CommentItem from '../component/comment/comment.js';
import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    prependChild,
    padTo2Digits,
    resolveImageUrl,
} from '../utils/function.js';
import {
    getPost,
    deletePost,
    writeComment,
    getComments,
    likePost,
    unlikePost,
} from '../requests/boardRequest.js';
import { isAlreadyLikedError, isLikeNotFoundError } from '../utils/likeError.js';
import {
    isPostLiked,
    markPostLiked,
    unmarkPostLiked,
} from '../utils/likedPosts.js';

const DEFAULT_PROFILE_IMAGE = '../public/image/profile/default.jpg';
const MAX_COMMENT_LENGTH = 1000;
const HTTP_NOT_AUTHORIZED = 401;
const HTTP_OK = 200;

const formatCount = value => {
    const count = Number(value);
    if (!Number.isFinite(count)) return value ?? '';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
};

const setLikeButtonState = (button, isLiked) => {
    button.classList.toggle('is-active', isLiked);
    button.setAttribute('aria-pressed', isLiked ? 'true' : 'false');
};

const parseDisplayedCount = element =>
    Number(element.textContent.replace(/,/g, '')) || 0;

const setDisplayedLikeCount = (element, count) => {
    element.textContent = formatCount(Math.max(count, 0));
};

const getQueryString = name => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
};

const getBoardDetail = async postId => {
    const { ok, data } = await getPost(postId);
    if (!ok)
        return new Error('게시글 정보를 가져오는데 실패하였습니다.');
    return data;
};

const setBoardDetail = (data, myInfo) => {
    // 헤드 정보
    const titleElement = document.querySelector('.title');
    const createdAtElement = document.querySelector('.createdAt');
    const imgElement = document.querySelector('.img');
    const nicknameElement = document.querySelector('.nickname');

    titleElement.textContent = data.title;
    const date = new Date(data.updatedAt);
    const formattedDate = `${date.getFullYear()}-${padTo2Digits(date.getMonth() + 1)}-${padTo2Digits(date.getDate())} ${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}:${padTo2Digits(date.getSeconds())}`;
    createdAtElement.textContent = formattedDate;

    imgElement.src = resolveImageUrl(
        data.author && data.author.profileImage,
        DEFAULT_PROFILE_IMAGE,
    );

    nicknameElement.textContent = data.author ? data.author.nickname : '';

    // 바디 정보
    const contentImgElement = document.querySelector('.contentImg');
    const fileUrl = data.postImageUrl;
    if (fileUrl) {
        console.log(fileUrl);
        const img = document.createElement('img');
        img.src = fileUrl;
        contentImgElement.appendChild(img);
    }
    const contentElement = document.querySelector('.content');
    contentElement.textContent = data.description;

    const likeButtonElement = document.querySelector('.likeButton');
    const likeCountElement = likeButtonElement.querySelector('h3');
    let isLiked =
        Boolean(data.isLiked) || isPostLiked(myInfo && myInfo.id, data.postId);
    let isLikeLoading = false;

    likeCountElement.textContent = formatCount(data.likesCount);
    setLikeButtonState(likeButtonElement, isLiked);

    likeButtonElement.addEventListener('click', async () => {
        if (isLikeLoading) return;
        isLikeLoading = true;

        try {
            if (!isLiked) {
                const { ok, status, code } = await likePost(data.postId);
                if (ok) {
                    isLiked = true;
                    markPostLiked(myInfo && myInfo.id, data.postId);
                    setLikeButtonState(likeButtonElement, isLiked);
                    setDisplayedLikeCount(
                        likeCountElement,
                        parseDisplayedCount(likeCountElement) + 1,
                    );
                } else if (isAlreadyLikedError({ status, code })) {
                    const unlikeResult = await unlikePost(data.postId);
                    if (!unlikeResult.ok) {
                        if (unlikeResult.status === HTTP_NOT_AUTHORIZED) {
                            window.location.href = '/html/login.html';
                            return;
                        }
                        Dialog('좋아요 취소 실패', '좋아요 취소에 실패하였습니다.');
                        return;
                    }
                    isLiked = false;
                    unmarkPostLiked(myInfo && myInfo.id, data.postId);
                    setLikeButtonState(likeButtonElement, isLiked);
                    setDisplayedLikeCount(
                        likeCountElement,
                        parseDisplayedCount(likeCountElement) - 1,
                    );
                } else if (status === HTTP_NOT_AUTHORIZED) {
                    window.location.href = '/html/login.html';
                } else {
                    Dialog('좋아요 실패', '좋아요 처리에 실패하였습니다.');
                }
            } else {
                const { ok, status, code } = await unlikePost(data.postId);
                if (ok) {
                    isLiked = false;
                    unmarkPostLiked(myInfo && myInfo.id, data.postId);
                    setLikeButtonState(likeButtonElement, isLiked);
                    setDisplayedLikeCount(
                        likeCountElement,
                        parseDisplayedCount(likeCountElement) - 1,
                    );
                } else if (isLikeNotFoundError({ status, code })) {
                    isLiked = false;
                    unmarkPostLiked(myInfo && myInfo.id, data.postId);
                    setLikeButtonState(likeButtonElement, isLiked);
                } else if (status === HTTP_NOT_AUTHORIZED) {
                    window.location.href = '/html/login.html';
                } else {
                    Dialog('좋아요 취소 실패', '좋아요 취소에 실패하였습니다.');
                }
            }
        } finally {
            isLikeLoading = false;
        }
    });

    const viewCountElement = document.querySelector('.viewCount h3');
    viewCountElement.textContent = formatCount(data.viewCount);

    const commentCountElement = document.querySelector('.commentCount h3');
    commentCountElement.textContent = '';
};

const setBoardModify = async (data, myInfo) => {
    if (data.author && myInfo.nickname === data.author.nickname) {
        const modifyElement = document.querySelector('.hidden');
        modifyElement.classList.remove('hidden');

        const modifyBtnElement = document.querySelector('#deleteBtn');
        const postId = getQueryString('id');
        modifyBtnElement.addEventListener('click', () => {
            Dialog(
                '게시글을 삭제하시겠습니까?',
                '삭제한 내용은 복구 할 수 없습니다.',
                async () => {
                    const { ok } = await deletePost(postId);
                    if (ok) {
                        window.location.href = '/';
                    } else {
                        Dialog('삭제 실패', '게시글 삭제에 실패하였습니다.');
                    }
                },
            );
        });

        const modifyBtnElement2 = document.querySelector('#modifyBtn');
        modifyBtnElement2.addEventListener('click', () => {
            window.location.href = `/html/board-modify.html?postId=${data.postId}`;
        });
    }
};

const getBoardComment = async id => {
    const { ok, status, data } = await getComments(id);
    if (!ok) return [];
    if (status !== HTTP_OK) return [];
    return data && data.comments ? data.comments : [];
};

const setBoardComment = (postId, data, myInfo) => {
    const commentListElement = document.querySelector('.commentList');
    if (commentListElement) {
        data.map(event => {
            const item = CommentItem(
                event,
                myInfo.nickname,
                postId,
                event.commentId,
            );
            commentListElement.appendChild(item);
        });
    }

    const commentCountElement = document.querySelector('.commentCount h3');
    if (commentCountElement) {
        commentCountElement.textContent = data.length.toLocaleString();
    }
};

const addComment = async () => {
    const comment = document.querySelector('textarea').value;
    const pageId = getQueryString('id');

    const { ok } = await writeComment(pageId, comment);

    if (ok) {
        window.location.reload();
    } else {
        Dialog('댓글 등록 실패', '댓글 등록에 실패하였습니다.');
    }
};

const inputComment = async () => {
    const textareaElement = document.querySelector(
        '.commentInputWrap textarea',
    );
    const commentBtnElement = document.querySelector('.commentInputBtn');

    if (textareaElement.value.length > MAX_COMMENT_LENGTH) {
        textareaElement.value = textareaElement.value.substring(
            0,
            MAX_COMMENT_LENGTH,
        );
    }
    if (textareaElement.value === '') {
        commentBtnElement.disabled = true;
        commentBtnElement.style.backgroundColor = '#ACA0EB';
    } else {
        commentBtnElement.disabled = false;
        commentBtnElement.style.backgroundColor = '#7F6AEE';
    }
};

const init = async () => {
    try {
        const myInfoResult = await authCheck();
        if (myInfoResult.status !== HTTP_OK) {
            throw new Error('사용자 정보를 불러오는데 실패하였습니다.');
        }

        const myInfo = myInfoResult.data;
        const commentBtnElement = document.querySelector('.commentInputBtn');
        const textareaElement = document.querySelector(
            '.commentInputWrap textarea',
        );
        textareaElement.addEventListener('input', inputComment);
        commentBtnElement.addEventListener('click', addComment);
        commentBtnElement.disabled = true;
        console.log(myInfo);
        if (myInfoResult.status === HTTP_NOT_AUTHORIZED) {
            window.location.href = '/html/login.html';
        }
        const profileImage = resolveImageUrl(
            myInfo.profileImageUrl,
            DEFAULT_PROFILE_IMAGE,
        );

        prependChild(document.body, Header('커뮤니티', 2, profileImage));

        const pageId = getQueryString('id');

        const pageData = await getBoardDetail(pageId);

        if (pageData.author && pageData.author.nickname === myInfo.nickname) {
            setBoardModify(pageData, myInfo);
        }
        setBoardDetail(pageData, myInfo);

        getBoardComment(pageId).then(data =>
            setBoardComment(pageId, data, myInfo),
        );
    } catch (error) {
        console.error(error);
    }
};

init();
