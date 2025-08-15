const formElement = document.getElementById('welcome-form');

function handleSubmit(event){
  event.preventDefault();
  
  const data = new FormData(formElement);
  const key = data.get('key');
  
  return browser.storage.local.set({key: btoa(key)}).then((value) => {
    browser.browserAction.setPopup({
      popup: browser.runtime.getURL("src/owf.html"),
    });
    browser.runtime.reload();
    return;
  });

  return;
}

formElement.addEventListener('submit', (event) => handleSubmit(event))