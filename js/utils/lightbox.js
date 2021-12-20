function showModal(modalElement) {
  // make sure bootrap script is loaded
  if (!window.bootstrap) return;

  const myModal = new window.bootstrap.Modal(modalElement);
  if (myModal) myModal.show();
}

//handle click for all img -> event delegtaion
//img click --> find all imgs with the same album/galley
//determine index of selected img
//show modal with selectec img
// handle prev/ next clik

export function registerLightbox({ modalId, prevSeclector, nextSelector, imgSelector }) {
  const modalElement = document.getElementById(modalId);
  if (!modalElement) return;

  // check if this modal is register or not
  if (Boolean(modalElement.dataset.register)) return;

  //selector
  const imgElement = modalElement.querySelector(imgSelector);
  const prevButton = modalElement.querySelector(prevSeclector);
  const nextButton = modalElement.querySelector(nextSelector);
  if (!imgElement || !prevButton || !nextButton) return;

  //lightbox vars
  let imgList = [];
  let currentIndex = 0;

  function showImageAtIndex(index) {
    imgElement.src = imgList[index].src;
  }

  document.addEventListener('click', (event) => {
    // console.log('click', event.target);
    const { target } = event;
    if (target.tagName !== 'IMG' || !target.dataset.album) return;

    //img with data album
    imgList = document.querySelectorAll(`img[data-album ="${target.dataset.album}"]`);
    currentIndex = [...imgList].findIndex((x) => x === target);
    console.log('album image click', { target, currentIndex, imgList });

    showImageAtIndex(currentIndex);
    showModal(modalElement);
  });

  prevButton.addEventListener('click', () => {
    // show prev img of current album
    currentIndex = (currentIndex - 1 + imgList.length) % imgList.length;
    showImageAtIndex(currentIndex);
  });

  nextButton.addEventListener('click', () => {
    // show next img of current album
    currentIndex = (currentIndex + 1) % imgList.length;
    showImageAtIndex(currentIndex);
  });

  //mark this modal is already registered
  modalElement.dataset.register = 'true';
}
