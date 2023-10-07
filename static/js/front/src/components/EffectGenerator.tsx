import React, {MouseEventHandler, useEffect, useRef} from "react";

interface EffectGeneratorProps{
    children: React.ReactNode | React.ReactNode[];
    style?: React.CSSProperties;
    rippleEffect?: boolean;
    candleEffect?: boolean;
    candleSize?: number;
    className?: string;
    onClick?: () => void;
    onMouseDown?: (e: any) => void;
}
function EffectGenerator(props: EffectGeneratorProps){
    const divRef = useRef() as React.MutableRefObject<HTMLDivElement>;

    function getElementOffset(element: HTMLDivElement){
        let de = document.documentElement
        let box = element.getBoundingClientRect()
        let top = box.top + window.scrollY - de.clientTop
        let left = box.left + window.scrollX - de.clientLeft
        return { top, left }
    }

    function handleRipple(e: React.MouseEvent<HTMLDivElement, MouseEvent>){
        if(!divRef.current) return

        if(!props.rippleEffect || !divRef.current) return
        if(divRef.current.className.includes("disabled")) return

        let offs = getElementOffset(divRef.current)
        let x = e.pageX - offs.left
        let y = e.pageY - offs.top
        let dia = Math.min(divRef.current.offsetHeight, divRef.current.offsetWidth, 100)

        let ripple = document.createElement("div")
        ripple.classList.add("ripple-inner")
        divRef.current.append(ripple)

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
    }

    useEffect(() => {
        if(!props.candleEffect || !divRef.current) return

        let canvas = document.createElement("div")
        let candle = document.createElement("div")
        canvas.classList.add("candle-canvas")
        candle.classList.add("candle")

        let elemColors = window.getComputedStyle(divRef.current).backgroundColor
            .replace("rgba(", "")
            .replace("rgb(", "")
            .replace(")", "")
            .split(",")
            .map(x => parseInt(x))
        let candleColor = `rgba(${255-elemColors[0]+50}, ${255-elemColors[1]+50}, ${255-elemColors[2]+50}, ${elemColors[3]+0.15 || .3})`
        candle.style.background = `radial-gradient(circle closest-side, ${candleColor}, transparent)`

        divRef.current.append(canvas)
        canvas.append(candle)

        return () => {
            canvas.remove()
        }
    }, [props.candleEffect, divRef.current])

    function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>){
        handleRipple(e)
        props.onClick?.()
    }
    function handleMouseEnter(){
        if(!divRef.current) return

        if(divRef.current.className.includes("disabled")) return
        if(!props.candleEffect || !divRef.current) return

        let candle = divRef.current.querySelector(".candle")
        if(!candle) return

        candle.classList.remove("candle-anim-back")
        candle.classList.add("candle-anim")
    }
    function handleMouseLeave(){
        if(!divRef.current) return

        if(divRef.current.className.includes("disabled")) return
        if(!props.candleEffect || !divRef.current) return

        let candle = divRef.current.querySelector(".candle")
        if(!candle) return

        candle.classList.remove("candle-anim")
        candle.classList.add("candle-anim-back")
    }
    function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>){
        if(!divRef.current) return

        if(divRef.current.className.includes("disabled")) return
        if(!props.candleEffect || !divRef.current) return

        let candle: HTMLDivElement = divRef.current.querySelector(".candle") as HTMLDivElement
        if(!candle) return

        let offset = getElementOffset(divRef.current)
        let x = e.pageX - offset.left
        let y = e.pageY - offset.top
        let dia = Math.max(divRef.current.offsetHeight, divRef.current.offsetWidth) * (props.candleSize || 1)

        candle.style.width = dia + "px"
        candle.style.height = dia + "px"
        candle.style.left = x - (dia/2) + "px"
        candle.style.top = y - (dia/2) + "px"
    }

    return (
        <div
            className={props.className + `${props.rippleEffect ? " ripple" : ""} ${props.candleEffect ? " candle-attached" : ""}`}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onMouseDown={props.onMouseDown}
            ref={divRef}
            style={props.style}
        >
            {props.children}
        </div>
    )
}

export default EffectGenerator;