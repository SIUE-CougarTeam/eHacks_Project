const createButton = document.querySelector(".new-timeline");
createButton.addEventListener("click", () => {
    const req = new XMLHttpRequest();
    req.addEventListener("load", reqListener);
    req.open("POST", "http://www.example.org/example.txt");
    req.send();
});

const interfereButton = document.querySelector(".interfere-timeline");
interfereButton.addEventListener("click", () => {
    const req = new XMLHttpRequest();
    req.addEventListener("load", reqListener);
    req.open("GET", "http://www.example.org/example.txt");
    req.send();
});

const beforeUnloadHandler = (event) => {
    // Recommended
    event.preventDefault();
  
    // Included for legacy support, e.g. Chrome/Edge < 119
    event.returnValue = true;
  };
  
//   const nameInput = document.querySelector("#name");
    window.addEventListener("beforeunload", beforeUnloadHandler);
  