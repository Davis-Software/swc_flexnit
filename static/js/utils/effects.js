(() => {
    function getElementOffset(element){
        let de = document.documentElement
        let box = element.getBoundingClientRect()
        let top = box.top + window.scrollY - de.clientTop
        let left = box.left + window.scrollX - de.clientLeft
        return { top, left }
    }

    function createRipple(elem) {
        elem.classList.add("ripple")
        elem.addEventListener("mousedown", e => {
            if(elem.classList.contains(".disabled")) {
                return
            }

            let offs = getElementOffset(elem)
            let x = e.pageX - offs.left
            let y = e.pageY - offs.top
            let dia = Math.min(elem.offsetHeight, elem.offsetWidth, 100)
            let ripple = document.createElement("div")
            ripple.classList.add("ripple-inner")
            elem.append(ripple)

            let rippleWave = document.createElement("div")
            rippleWave.classList.add("ripple-wave")
            rippleWave.style.left = (x - dia/2).toString() + "px"
            rippleWave.style.top = (y - dia/2).toString() + "px"
            rippleWave.style.width = dia.toString() + "px"
            rippleWave.style.height = dia.toString() + "px"

            ripple.append(rippleWave)
            rippleWave.addEventListener("animationend", _ => {
                ripple.remove()
            })
        })
    }


    function attachCandle(elem, size=1){
        elem.classList.add("candle-attached")

        let canvas = document.createElement("div")
        let candle = document.createElement("div")
        canvas.classList.add("candle-canvas")
        candle.classList.add("candle")

        let elemColors = window.getComputedStyle(elem).backgroundColor
            .replace("rgba(", "")
            .replace("rgb(", "")
            .replace(")", "")
            .replaceAll(" ", "")
            .split(",")
            .map(x => parseInt(x))
        let candleColor = `rgba(${255-elemColors[0]+50}, ${255-elemColors[1]+50}, ${255-elemColors[2]+50}, ${elemColors[3]+0.15 || .3})`
        candle.style.background = `radial-gradient(circle closest-side, ${candleColor}, transparent)`

        elem.append(canvas)
        canvas.append(candle)

        elem.addEventListener("mouseenter", e => {
            if(e.target !== elem) return
            candle.classList.remove("candle-anim-back")
            candle.classList.add("candle-anim")
        })
        elem.addEventListener("mouseleave", e => {
            if(e.target !== elem) return
            candle.classList.remove("candle-anim")
            candle.classList.add("candle-anim-back")
        })
        elem.addEventListener("mousemove", e => {
            let offset = getElementOffset(elem)
            let x = e.pageX - offset.left
            let y = e.pageY - offset.top
            let dia = Math.max(elem.offsetHeight, elem.offsetWidth) * 2 * size

            candle.style.width = dia + "px"
            candle.style.height = dia + "px"
            candle.style.left = x - (dia/2) + "px"
            candle.style.top = y - (dia/2) + "px"
        })
    }


    function addListeners(list, callback, className){
        list = Array.from(list).map(selector => selector + `:not(.${className})`)
        if(list.join(", ") === "") return
        document.querySelectorAll(list.join(", ")).forEach(elem => {
            elem.classList.add(className)
            callback(elem)
        })
    }

    function addRipples(){
        addListeners([
            ".btn",
            ".dropdown-item",
            ".card-header",
            ".list-group-item",
            ".attach-ripple"
        ], createRipple, "ripple")
    }
    function addCandles(){
        addListeners([
            ".btn",
            ".attach-candle"
        ], attachCandle, "candle-attached")
    }

    addRipples()
    addCandles()
    setInterval(addRipples, 1000)
    setInterval(addCandles, 1000)
    document.addEventListener("click", addListeners)
    document.addEventListener("click", addCandles)

    namespaces.createRipple = createRipple
    namespaces.attachCandle = attachCandle
})()
