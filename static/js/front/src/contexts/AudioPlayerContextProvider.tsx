import React, {createContext, useEffect, useState, SetStateAction, Suspense, lazy} from "react";
import SongType from "../types/songType";

const SongPlayer = lazy(() => import("../components/music/SongPlayer"));


interface AudioPlayerContextProps{
    setMounted: React.Dispatch<SetStateAction<boolean>>
    playingSong: SongType | null
    setPlayingSong: React.Dispatch<SetStateAction<SongType | null>>
    songState: number
}
const AudioPlayerContext = createContext<AudioPlayerContextProps>({
    setMounted: () => {},
    playingSong: null,
    setPlayingSong: () => {},
    songState: 0
});


interface AudioPlayerContextProviderProps {
    children: React.ReactNode | React.ReactNode[]
}
function AudioPlayerContextProvider(props: AudioPlayerContextProviderProps){
    const [firstMounted, setFirstMounted] = useState<boolean>(false)
    const [mounted, setMounted] = useState<boolean>(false)
    const [playingSong, setPlayingSong] = useState<SongType | null>(null)
    const [songState, setSongState] = useState<number>(0)

    useEffect(() => {
        if(!mounted || firstMounted) return
        setFirstMounted(true)
    }, [mounted]);

    return (
        <>
            <AudioPlayerContext.Provider value={{
                setMounted,
                playingSong,
                setPlayingSong,
                songState
            }}>
                {props.children}
            </AudioPlayerContext.Provider>
            <Suspense>
                {firstMounted && (
                    <SongPlayer
                        playingSong={playingSong}
                        setPlayingSong={setPlayingSong}
                        mounted={firstMounted && mounted}
                        songEnded={() => setSongState(prev => prev + 1)}
                    />
                )}
            </Suspense>
        </>
    )
}

export {AudioPlayerContextProvider, AudioPlayerContext}