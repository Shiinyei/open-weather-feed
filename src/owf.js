const formElement = document.getElementById('owf-form-new');
const inputElement = document.getElementById('owf-input-new-location');
const locationsFieldset = document.getElementById('owf-input-locations');

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

function resetLocationsFieldset(){
  locationsFieldset.classList.add('hidden');
  const existingChildren = locationsFieldset.getElementsByTagName('*');
  for(const child of existingChildren){
    if(child.tagName !== 'legend')
      child.remove();
  }
}

inputElement.addEventListener('input', debounce((event) => {
  resetLocationsFieldset();

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
      if(Array.isArray(response)){
        if(response.length === 0){
          const divElement = document.createElement('div');
          divElement.innerHTML = 'No results found';
          locationsFieldset.appendChild(divElement);
        }

        response.forEach(location => {
          const divElement = document.createElement('div');
          const labelElement = document.createElement('label');
          const radioElement = document.createElement('input');

          radioElement.setAttribute('type','radio');
          labelElement.appendChild(radioElement);

          const labelInnerText = `${location.name}, ${location.state ? location.state+', ' : ''} ${location.country}`;
          labelElement.innerHTML = labelElement.innerHTML + labelInnerText;

          divElement.appendChild(labelElement);
          locationsFieldset.appendChild(divElement);
        })

        locationsFieldset.classList.remove('hidden');
      }
      return response;
    })
}, 500))