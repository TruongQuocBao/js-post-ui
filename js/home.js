import postApi from './api/postApi';
import { renderPostList, renderPagination, initSearch, initPagination, toast } from './utils';

async function handleFilterChange(filterName, filterValue) {
  try {
    // update query parmas
    const url = new URL(window.location);
    if (filterName) url.searchParams.set(filterName, filterValue);

    //reset page if needed
    if (filterName === 'title_like') url.searchParams.set('_page', 1);

    history.pushState({}, '', url);

    //fectapi
    // render postlist
    const { data, pagination } = await postApi.getAll(url.searchParams);
    renderPostList(data);
    renderPagination('pagination', pagination);
  } catch (error) {
    console.log('failed to fetch post list', error);
  }
}

function registerPostDeleteEvent() {
  document.addEventListener('post-delete', async (event) => {
    try {
      // const post = event.detail;
      // document.getElementById(
      //   'content-modal'
      // ).textContent = `Are you sure to remove post "${post.title}"?`;

      // // const removeModal = new window.bootstrap.Modal(document.getElementById('remove-modal'));
      // // if (removeModal) removeModal.show();

      const post = event.detail;
      const message = `Are you sure to remove post "${post.title}"?`;
      if (window.confirm(message)) {
        await postApi.remove(post.id);
        await handleFilterChange();
        toast.success('Remove post successfully');
      }
    } catch (error) {
      console.log('falied to remove post', error);
      toast.error(error.message);
    }
  });
}

(async () => {
  try {
    const url = new URL(window.location);

    // update search params if needed
    if (!url.searchParams.get('_page')) url.searchParams.set('_page', 1);
    if (!url.searchParams.get('_limit')) url.searchParams.set('_limit', 9);

    history.pushState({}, '', url);

    const queryParams = url.searchParams;

    registerPostDeleteEvent();
    // registerCancelEvent();

    //attach click event for links
    initPagination({
      elementId: 'pagination',
      defaultParams: queryParams,
      onChange: (page) => handleFilterChange('_page', page),
    });

    initSearch({
      elementId: 'searchInput',
      defaultParams: queryParams,
      onChange: (value) => handleFilterChange('title_like', value),
    });

    // const { data, pagination } = await postApi.getAll(queryParams);
    // renderPostList(data);
    // renderPagination('pagination', pagination);
    handleFilterChange();
  } catch (error) {
    console.log('get all failed', error);
    //show nodal, toast error
  }
})();
