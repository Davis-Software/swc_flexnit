import {RefObject, useEffect, useMemo, useState} from "react";

function useIsInView(ref: RefObject<HTMLElement>, persist: boolean = false){
    const [isIntersecting, setIntersecting] = useState(false)

    const observer = useMemo(() => new IntersectionObserver(
    ([entry]) => setIntersecting(p => (p && persist ? true : entry.isIntersecting))
    ), [ref])


    useEffect(() => {
        observer.observe(ref.current!)
        return () => observer.disconnect()
    }, [ref.current])

    return isIntersecting
}

export default useIsInView