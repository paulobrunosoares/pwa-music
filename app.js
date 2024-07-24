if ("serviceWorker" in navigator) {
  // window.addEventListener('load', function() {
  //     navigator.serviceWorker.register('sw.js');
  // });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      console.log("Service worker registered.", reg);
    });
  });
}
