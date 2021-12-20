import { randomNumber, setTextContent } from './common';
import { setfieldValue, setBackgroundImage } from './common';
import * as yup from 'yup';
// import { flatten } from 'lodash';

const ImageSource = {
  PICSUM: 'picsum',
  UPLOAD: 'upload',
};

function setFormValues(form, formValues) {
  setfieldValue(form, '[name="title"]', formValues?.title);
  setfieldValue(form, '[name="author"]', formValues?.author);
  setfieldValue(form, '[name="description"]', formValues?.description);

  setfieldValue(form, '[name="imageUrl"]', formValues?.imageUrl); //hidden field
  setBackgroundImage(document, '#postHeroImage', formValues?.imageUrl);
}

function getFormValues(form) {
  const formValues = {};

  // s1: query each input and  add to values object
  // ['title', 'author', 'description', 'imageUrl'].forEach((name) => {
  //   const field = form.querySelector(`[name = "${name}"]`);
  //   if (field) formValues[name] = field.value;
  // });

  // s2: using formdata
  const data = new FormData(form);
  for (const [key, value] of data) {
    formValues[key] = value;
  }

  return formValues;
}

function getTitleError(form) {
  const titleElement = form.querySelector('[name="title"]');
  if (!titleElement) return;

  //required
  if (titleElement.validity.valueMissing) return 'Please enter title ';

  //at least two words
  if (
    titleElement.value.split(' ').filter((x) => {
      !!x && x.length >= 3;
    }).length < 2
  )
    return 'Please enter at least two  words of 3 character';

  return '';
}

function getPostSchema() {
  return yup.object().shape({
    title: yup.string().required('please enter title'),
    author: yup
      .string()
      .required('please enter author')
      .test(
        'at least two words',
        'Please enter at least two words',
        (value) => value.split(' ').filter((x) => !!x && x.length >= 3).length >= 2
      ),
    description: yup.string(),
    imageSource: yup
      .string()
      .required('Please select an image source')
      .oneOf([ImageSource.PICSUM, ImageSource.UPLOAD], 'ivalid image source'),
    imageUrl: yup.string().when('imageSource', {
      is: ImageSource.PICSUM,
      then: yup
        .string()
        .required('please random a background image')
        .url('please enter  a valid url'),
    }),
    image: yup.mixed().when('imageSource', {
      is: ImageSource.UPLOAD,
      then: yup
        .mixed()
        .test('required', 'Please select an image to upload', (file) => Boolean(file?.name))
        .test('max-5mb', 'The image too large (max 5mb)', (file) => {
          const fileSize = file?.size || 0;
          const MAX_SIZE = 5 * 1024 * 1024;
          return fileSize <= MAX_SIZE;
        }),
    }),
  });
}

function setFieldError(form, name, error) {
  const element = form.querySelector(`[name="${name}"]`);
  if (element) {
    element.setCustomValidity(error);
    setTextContent(element.parentElement, '.invalid-feedback', error);
  }
}

async function validatePostForm(form, formValues) {
  /* vlaidated by js
  // get error
  const errors = {
    title: getTitleError(form),
  };
  // set error
  for (const key in errors) {
    const element = form.querySelector(`[name="${key}"]`);
    if (element) {
      element.setCustomValidity(errors[key]);
      setTextContent(element.parentElement, '.invalid-feedback', errors[key]);
    }
  }
  */

  /* Validate by yup */
  try {
    // reset previous error
    ['title', 'author', 'imageUrl', 'image'].forEach((name) => setFieldError(form, name, ''));

    // start validating
    const schema = getPostSchema();
    await schema.validate(formValues, { abortEarly: false });
  } catch (error) {
    // console.log(error.name);
    // console.log(error.inner);

    const errorLog = {};

    if (error.name === 'ValidationError' && Array.isArray(error.inner)) {
      for (const validationError of error.inner) {
        const name = validationError.path;

        // ignore if the field already logged
        if (errorLog[name]) continue;

        // set feild error and mark ad logged
        setFieldError(form, name, validationError.message);
        errorLog[name] = true;
      }
    }
  }
  //add was-validated class to form element
  const isValid = form.checkValidity();
  if (!isValid) form.classList.add('was-validated');
  return isValid;
}

async function validateFormFiled(form, formValues, name) {
  try {
    // clear previous error
    setFieldError(form, name, '');

    const schema = getPostSchema();
    await schema.validateAt(name, formValues);
  } catch (error) {
    setFieldError(form, name, error.message);
  }

  //show validation error (if any)
  const field = form.querySelector(`[name="${name}"]`);
  if (field && !field.checkValidity()) {
    field.parentElement.classList.add('was-validated');
  }
}

function showLoading(form) {
  const button = form.querySelector('[name="submit"]');
  if (button) {
    button.disabled = true;
    button.textContent = 'Saving...';
  }
}

function hideLoading(form) {
  const button = form.querySelector('[name="submit"]');
  if (button) {
    button.disabled = false;
    button.textContent = 'Save';
  }
}

function initRandomImage(form) {
  const randomButton = document.getElementById('postChangeImage');
  if (randomButton) {
    randomButton.addEventListener('click', () => {
      const imageUrl = `https://picsum.photos/id/${randomNumber(1000)}/1378/400`;

      setfieldValue(form, '[name="imageUrl"]', imageUrl); //hidden field
      setBackgroundImage(document, '#postHeroImage', imageUrl);
    });
  }
}

function renderImageSourceControl(form, selectedValue) {
  const controlList = form.querySelectorAll('[data-id="imageSource"]');
  controlList.forEach((control) => {
    control.hidden = control.dataset.imageSource !== selectedValue;
  });
}

function initRadioImageSource(form) {
  const radioList = form.querySelectorAll('[name="imageSource"]');
  radioList.forEach((radio) => {
    radio.addEventListener('change', (event) => renderImageSourceControl(form, event.target.value));
  });
}

function initUploadImage(form) {
  const uploadImage = form.querySelector('[name="image"]');
  if (!uploadImage) return;

  uploadImage.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(document, '#postHeroImage', imageUrl);

      validateFormFiled(form, { imageSource: ImageSource.UPLOAD, image: file }, 'image');
    }
  });
}

function initValidationOnChange(form) {
  ['title', 'author'].forEach((name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) {
      field.addEventListener('input', (event) => {
        const newValue = event.target.value;
        validateFormFiled(form, { [name]: newValue }, name);
      });
    }
  });
}

export function initPostForm({ formId, defaultValues, onSubmit }) {
  const form = document.getElementById(formId);
  if (!form) return;

  let submiting = false;
  setFormValues(form, defaultValues);

  // innit Event
  initRandomImage(form);
  initRadioImageSource(form);
  initUploadImage(form);
  initValidationOnChange(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    //prevent other submition
    if (submiting) return;

    // show loading
    showLoading(form);
    submiting = true;

    //get form values
    const formValues = getFormValues(form);
    formValues.id = defaultValues.id;
    console.log(formValues);

    // validation
    // if valid trigger submit callback
    // otherwise, show validation error
    const isValid = await validatePostForm(form, formValues);
    if (isValid) await onSubmit?.(formValues);

    hideLoading(form);
    submiting = false;
    console.log('AAAAAAAAAAAAA');
  });
}
