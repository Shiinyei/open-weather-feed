function main() {
  browser.storage.local.get().then(value => {
    if(value.key){
      browser.browserAction.setPopup({
        popup: browser.runtime.getURL("src/opf.html"),
      });
    }
    else{
      browser.browserAction.setPopup({
        popup: browser.runtime.getURL("src/welcome.html"),
      });
    }
  })
}

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.reload();
})

main();