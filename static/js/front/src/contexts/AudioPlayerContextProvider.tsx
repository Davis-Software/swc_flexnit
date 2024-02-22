import React, {useRef, createContext} from "react";


interface AudioPlayerContextProps{
    audioRef: React.RefObject<HTMLAudioElement> | null
    mounted: boolean
    setMounted?: React.Dispatch<React.SetStateAction<boolean>>
}
const AudioPlayerContext = createContext<AudioPlayerContextProps>({
    audioRef: null,
    mounted: false
});


interface AudioPlayerContextProviderProps {
    children: React.ReactNode | React.ReactNode[]
    audioProps?: React.AudioHTMLAttributes<HTMLAudioElement>
}
function AudioPlayerContextProvider(props: AudioPlayerContextProviderProps){
    const audioRef = useRef<HTMLAudioElement>(null);
    const [mounted, setMounted] = React.useState<boolean>(false)

    return (
        <AudioPlayerContext.Provider value={{
            audioRef: audioRef,
            mounted: mounted,
            setMounted: setMounted
        }}>
            {props.children}
            <audio
                ref={audioRef}
                {...props.audioProps}
                autoPlay
            />
        </AudioPlayerContext.Provider>
    )
}

export {AudioPlayerContextProvider, AudioPlayerContext}