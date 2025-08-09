if(localStorage.getItem("key")){
  browser.browserAction.setPopup({
    popup: browser.runtime.getURL("src/opf.html"),
  });
}
else{
  browser.browserAction.setPopup({
    popup: browser.runtime.getURL("src/welcome.html"),
  });
}
