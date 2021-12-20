import postApi from './api/postApi';
import { initPostForm, toast } from './utils';

function removeUnusedFields(formValues) {
  const payload = { ...formValues };

  // imageSource = 'picsum' --> remove image
  // imageSource = 'upload' --> remove imageurl

  if (payload.imageSource === 'upload') {
    delete payload.imageUrl;
  } else {
    delete payload.image;
  }

  delete payload.imageSource;

  // remiove id if it's add mode
  if (!payload.id) delete payload.id;

  return payload;
}

function jsonToFormData(jsonObject) {
  const formData = new FormData();

  for (const key in jsonObject) {
    formData.set(key, jsonObject[key]);
  }
  return formData;
}

async function handlePostFormSubmit(formValues) {
  try {
    const payload = removeUnusedFields(formValues);
    const formData = jsonToFormData(payload);

    // Check add/edit mode
    //s1: check on search params (check id)
    //s2: check id in formValues
    // call API

    const savedPost = formValues.id
      ? await postApi.updateFormData(formData)
      : await postApi.addFormData(formData);

    // show succes message
    toast.success('Save Post Success');

    // redirect to detail page
    setTimeout(() => {
      window.location.assign(`./post-detail.html?id=${savedPost.id}`);
    }, 2000);
  } catch (error) {
    console.log('failed to save post', error);
    toast.error(`error: ${error.message}`);
  }
}

//main
(async () => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const postId = searchParams.get('id');

    const defaultValues = Boolean(postId)
      ? await postApi.getById(postId)
      : {
          title: '',
          description: '',
          author: '',
          imageUrl: '',
        };

    initPostForm({
      formId: 'postForm',
      defaultValues,
      onSubmit: handlePostFormSubmit,
    });

    // console.log('id', postId);
    // console.log('mode: ', postId ? 'edit' : 'add');
    // console.log('defaultValues: ', defaultValues);
  } catch (error) {
    console.log('failed to fetch post detail', error);
  }
})();
