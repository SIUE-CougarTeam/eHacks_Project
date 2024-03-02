const createButton = document.querySelector(".new-timeline");
createButton.addEventListener("click", () => {
    const req = new XMLHttpRequest();
    req.addEventListener("load", reqListener);
    req.open("POST", "http://www.example.org/example.txt");
    req.send();
});

const interfereButton = document.querySelector("interfere-timeline");
interfereButton.addEventListener("click", () => {
    const req = new XMLHttpRequest();
    req.addEventListener("load", reqListener);
    req.open("GET", "http://www.example.org/example.txt");
    req.send();
});