const namespaces = {}

document.querySelectorAll(".js-year").forEach((el) => {
    el.textContent = new Date().getFullYear().toString()
})