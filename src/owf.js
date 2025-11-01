const formElement = document.getElementById('owf-form-new');
const inputElement = document.getElementById('owf-input-new-location');

const OWM_GEO_ENDPOINT = 'https://api.openweathermap.org/geo/1.0/direct';

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
  browser.storage.local.get('key')
    .then(({key}) => {
      const searchStr = event.target.value;
      const apiKey = atob(key);
      return fetch(
        `${OWM_GEO_ENDPOINT}?appid=${apiKey}&q=${searchStr}&limit=5`
      );
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log('RESPONSE',JSON.stringify(response));
      return response;
    })

}, 500))