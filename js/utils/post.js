import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { setTextContent, truncateText } from './common';

//to use fromnow func
dayjs.extend(relativeTime);

export function createPostElement(post) {
  if (!post) return;

  // find and clone template
  const postTemplate = document.getElementById('postTemplate');
  if (!postTemplate) return;

  const liElement = postTemplate.content.firstElementChild.cloneNode(true);
  if (!liElement) return;

  //update title, description, author, thumnail, timespan
  setTextContent(liElement, '[data-id="title"]', post.title);
  setTextContent(liElement, '[data-id="description"]', truncateText(post.description, 135));
  setTextContent(liElement, '[data-id="author"]', post.author);
  setTextContent(liElement, '[data-id="timeSpan"]', `-${dayjs(post.updatedAt).fromNow()}`);

  const thumbnailElement = liElement.querySelector('[data-id = "thumbnail"]');
  if (thumbnailElement) {
    thumbnailElement.src = post.imageUrl;

    // load image error
    thumbnailElement.addEventListener('error', () => {
      thumbnailElement.src = 'https://via.placeholder.com/728x90.png?text=thumbnail';
    });
  }

  return liElement;
}

export function renderPostList(postList) {
  console.log({ postList });
  if (!Array.isArray(postList) || postList.length === 0) return;

  const ulElement = document.getElementById('postList');
  if (!ulElement) return;

  //clear current post list
  ulElement.textContent = '';

  postList.forEach((post) => {
    const liElement = createPostElement(post);
    ulElement.appendChild(liElement);
  });
}
