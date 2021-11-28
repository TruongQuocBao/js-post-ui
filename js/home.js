import postApi from './api/postapi';
import { renderPostList, renderPagination, initSearch, initPagination } from './utils';

async function handleFilterChange(filterName, filterValue) {
  try {
    // update query parmas
    const url = new URL(window.location);
    url.searchParams.set(filterName, filterValue);

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

(async () => {
  try {
    const url = new URL(window.location);

    // update search params if needed
    if (!url.searchParams.get('_page')) url.searchParams.set('_page', 1);
    if (!url.searchParams.get('_limit')) url.searchParams.set('_limit', 9);

    history.pushState({}, '', url);

    const queryParams = url.searchParams;

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

    const { data, pagination } = await postApi.getAll(queryParams);
    renderPostList(data);
    renderPagination('pagination', pagination);
  } catch (error) {
    console.log('get all failed', error);
    //show nodal, toast error
  }
})();
