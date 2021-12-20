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
      thumbnailElement.src = 'https://via.placeholder.com/300x200.png?text=thumbnail';
    });
  }

  // attach event
  // go to post detail when click on div.post-item
  const divElement = liElement.firstElementChild;
  if (divElement) {
    divElement.addEventListener('click', (event) => {
      // S2: if  event  is triggered from menu --> ignore
      const menu = liElement.querySelector('[data-id="menu"]');
      if (menu && menu.contains(event.target)) return;

      window.location.assign(`./post-detail.html?id=${post.id}`);
    });
  }

  // add click event for edit button
  const editButton = liElement.querySelector('[data-id = "edit"]');
  if (editButton) {
    editButton.addEventListener('click', () => {
      console.log('edit click');
      // S1: prevent event bubbing  to parent
      // e.stopPropagation()

      window.location.assign(`./add-edit-post.html?id=${post.id}`);
    });
  }

  // add click event for reomve button
  const removeButton = liElement.querySelector('[data-id = "remove"]');
  if (removeButton) {
    removeButton.addEventListener('click', () => {
      const customEvent = new CustomEvent('post-delete', {
        bubbles: true,
        detail: post,
      });

      removeButton.dispatchEvent(customEvent);
    });
  }

  // cancel click

  // const cancelButton = document.getElementById('cancel');
  // if (cancelButton) {
  //   cancelButton.addEventListener('click', () => {
  //     console.log('11111111');
  //     const customEvent = new CustomEvent('cancel-btn', {
  //       bubbles: true,
  //       detail: post,
  //     });
  //     cancelButton.dispatchEvent(customEvent);

  //     // const removeModal = new window.bootstrap.Modal(document.getElementById('remove-modal'));
  //     // if (removeModal) removeModal.hide();
  //   });
  // }

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
