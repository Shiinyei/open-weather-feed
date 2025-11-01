const formElement = document.getElementById('owf-form-new');
const inputElement = document.getElementById('owf-input-new-location');

/**
 * [Source](https://stackoverflow.com/a/75988895)
 */
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
}

inputElement.addEventListener('input', debounce((event) => {
  browser.storage.local.get('key').then(
    ({key}) => {
      const searchStr = event.target.value;
      const apiKey = atob(key);
      return apiKey;
    }
  )
}, 500))