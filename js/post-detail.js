import dayjs from 'dayjs';
import postApi from './api/postApi';
import { registerLightbox, setTextContent } from './utils';

function renderPostDetail(post) {
  // render title
  // render description
  // render author
  // render timespan

  setTextContent(document, '#postDetailTitle', post.title);
  setTextContent(document, '#postDetailDescription', post.description);
  setTextContent(document, '#postDetailAuthor', post.author);
  setTextContent(
    document,
    '#postDetailTimeSpan',
    dayjs(post.updatedAt).format(' - DD/MM/YYYY HH: mm')
  );

  // render hero image (imageURL)
  const heroImage = document.getElementById('postHeroImage');
  if (heroImage) {
    heroImage.style.backgroundImage = `url("${post.imageUrl}")`;

    // load image error
    heroImage.addEventListener('error', () => {
      console.log('error');
      thumbnailElement.src = 'https://via.placeholder.com/300x200.png?text=thumbnail';
    });
  }

  // render deit page link
  const editPageLink = document.getElementById('goToEditPageLink');
  if (editPageLink) {
    editPageLink.href = `/add-edit-post.html?id=${post.id}`;
    editPageLink.innerHTML = '<i class = "fas fa-edit"></i> Edit Post';
  }
}

(async () => {
  registerLightbox({
    modalId: 'lightbox',
    imgSelector: 'img[data-id = "lightboxImg"]',
    prevSeclector: 'button[data-id = "lightboxPrev"]',
    nextSelector: 'button[data-id = "lightboxNext"]',
  });
  // get post id from URL
  // fetch post detail api
  //reder post detail
  try {
    const searchparams = new URLSearchParams(window.location.search);
    const postId = searchparams.get('id');
    if (!postId) {
      console.log('post not found');
      return;
    }

    const post = await postApi.getById(postId);
    renderPostDetail(post);
  } catch (error) {
    console.log('faile to fetch post detail', error);
  }
})();
