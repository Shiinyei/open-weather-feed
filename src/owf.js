const topbarElement = document.getElementById('owf-topbar');
const addTabElement = document.getElementById('owf-add');
const formElement = document.getElementById('owf-form-new');
const inputElement = document.getElementById('owf-input-new-location');
const locationsFieldset = document.getElementById('owf-input-locations');
const buttonElement = document.getElementById('owf-btn-submit-location');
const addLocationTab = document.getElementById('owf-tab-new');
const forecastTab = document.getElementById('owf-tab-forecast');

const OWM_GEO_ENDPOINT = 'https://api.openweathermap.org/geo/1.0/direct';
const OWM_FORECAST_ENDPOINT = 'https://api.openweathermap.org/data/2.5/forecast';

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

function onClickTab(index){
  return browser.storage.local.get(['locationTabs','key'])
    .then(({locationTabs, key}) => {
      if(!locationTabs || !Array.isArray(locationTabs)){
        return locationTabs;
      }
      const locationInfo = locationTabs[index];
      const apiKey = atob(key);

      addLocationTab.classList.add('hidden');
      forecastTab.classList.remove('hidden');

      return fetch(
        `${OWM_FORECAST_ENDPOINT}?appid=${apiKey}&lat=${locationInfo.lat}&lon=${locationInfo.lon}&units=metric`
      );
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log('RESPONSE DATA',data);
    });
}

function resetLocationsFieldset(){
  locationsFieldset.classList.add('hidden');
  buttonElement.classList.add('hidden');
  const existingChildren = locationsFieldset.getElementsByTagName('*');
  for(const child of existingChildren){
    if(child.tagName.toLowerCase() !== 'legend'){
      child.remove();
    }
  }
}

function resetLocationTabs(){
  const existingChildren = topbarElement.getElementsByTagName('button');
  for(const i in existingChildren){
    if(i === "0"){
      continue;
    }
    const element = existingChildren[i];
    if(element instanceof HTMLButtonElement){
      element.remove();
    }
  }
}

function refreshLocationTabs(){
  return browser.storage.local.get('locationTabs')
    .then(({locationTabs}) => {
      resetLocationTabs();
      if(!locationTabs || !Array.isArray(locationTabs)){
        return locationTabs;
      }

      locationTabs.forEach((location,index) => {
        const buttonElement = document.createElement('button');
        buttonElement.innerHTML = location.name;
        buttonElement.addEventListener('click', () => onClickTab(index));
        topbarElement.appendChild(buttonElement);
      });
      return locationTabs;
    });
}

/**
 * EVENT INITIALIZATION & FUNCTION CALLS
 */
refreshLocationTabs();

addTabElement.addEventListener('click', () => {
  addLocationTab.classList.remove('hidden');
  forecastTab.classList.add('hidden');
});

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
        response.forEach(location => {
          const divElement = document.createElement('div');
          const labelElement = document.createElement('label');
          const radioElement = document.createElement('input');

          radioElement.setAttribute('type','radio');
          radioElement.setAttribute('name','chosenLocation');
          radioElement.setAttribute('value',JSON.stringify(location));
          labelElement.appendChild(radioElement);

          const labelInnerText = `${location.name}, ${location.state ? location.state+', ' : ''} ${location.country}`;
          labelElement.innerHTML = labelElement.innerHTML + labelInnerText;

          divElement.appendChild(labelElement);
          locationsFieldset.appendChild(divElement);
        });

        if(response.length === 0){
          const divElement = document.createElement('div');
          divElement.innerHTML = 'No results found';
          locationsFieldset.appendChild(divElement);
        }
        else{
          buttonElement.classList.remove('hidden');
        }

        locationsFieldset.classList.remove('hidden');
      }
      return response;
    })
}, 500))

formElement.addEventListener('submit', (event) => {
  const data = new FormData(formElement);
  const chosenLocation = JSON.parse(data.get('chosenLocation'));

  return browser.storage.local.get('locationTabs')
    .then(({locationTabs}) => {
      // No locations registered yet
      if(typeof locationTabs === 'undefined'){
        return browser.storage.local.set({locationTabs: [chosenLocation]});
      }
      // Add location to existing ones
      else{
        const newLocationTabs = locationTabs.concat([chosenLocation]);
        return browser.storage.local.set({locationTabs: newLocationTabs});
      }
    })
    .then((value) => {
      refreshLocationTabs();
    })
});