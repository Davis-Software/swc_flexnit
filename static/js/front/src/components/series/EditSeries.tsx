import React, {useMemo} from "react";
import SeriesType, {EpisodeType} from "../../types/seriesType";
import {Button, Checkbox, Collapse, Fade, FormControlLabel, TextField} from "@mui/material";
import {hasNSFWPermission} from "../../utils/permissionChecks";

const AddEpisode = React.lazy(() => import("./EditEpisode").then(module => ({default: module.AddEpisode})));
const EditEpisode = React.lazy(() => import("./EditEpisode"));

interface SeasonOverviewProps{
    seriesProps: EditSeriesProps;
    season: number;
    handleAddEpisode: (season: number, episode_count: number) => void;
    handleAddEpisodes: (season: number, episode_count: number, episodes: FileList) => void;
    episodeUploadProgress: {[filename: string]: number};
    setSelectedEpisode: (episode: EpisodeType | null) => void;
}
function SeasonOverview(props: SeasonOverviewProps){
    const [open, setOpen] = React.useState<boolean>(false)
    const episodes = useMemo(() => (
        props.seriesProps.series.episodes.sort((a, b) => a.episode - b.episode).filter(episode => episode.season === props.season + 1)
    ), [props.seriesProps.series.episodes, props.season, props.seriesProps.series.season_count])

    function handleDetectEpisodeIntros(){
        if(!confirm("Are you sure you want to detect intros for all episodes in this season?")) return
        const formData = new FormData()
        formData.append("season", (props.season + 1).toString())
        fetch(`/series/${props.seriesProps.series.uuid}/detect`, {
            method: "POST",
            body: formData
        }).then(() => {
            alert("Detection might be done, check manually. Also you might need to refresh the page.")
        })
        alert("Detection started, warning: this will take a while and there is no way to track progress.")
    }
    function handleConvertSeason(reEncode: boolean = false){
        if(!confirm("Are you sure you want to convert all episodes in this season to HLS?")) return
        if(reEncode){
            if(!confirm("This will take a while, are you sure?")) return
        }

        const formData = new FormData()
        formData.append("season", (props.season + 1).toString())
        fetch(`/series/${props.seriesProps.series.uuid}/convert${reEncode ? "?encode" : ""}`, {
            method: "POST",
            body: formData
        }).then(() => {
            alert("Conversion might be done, check manually. Also you might need to refresh the page.")
        })
        alert("Conversion started, warning: this will take a while and there is no way to track progress.")
    }
    function handleDeleteEpisode(episode: EpisodeType){
        if(!confirm("Are you sure you want to delete this episode?")) return
        fetch(`/series/${props.seriesProps.series.uuid}/episode/${episode.uuid}/delete`, {
            method: "POST"
        }).then(() => {
            props.seriesProps.setSeries(pv => pv !== null ? ({
                ...pv,
                episodes: pv.episodes.filter(ep => ep.uuid !== episode.uuid)
            }) : null)
        })
    }

    return (
        <div className="card">
            <div className="card-header" onClick={() => {setOpen(pv => !pv)}}>
                <h5>Season {props.season + 1}</h5>
            </div>
            <Collapse in={open}>
                <div className="card-body">
                    <div className="d-flex">
                        <Button className="flex-grow-1" variant="contained" component="label" onClick={() => {
                            props.handleAddEpisode(props.season + 1, episodes.length)
                        }}>
                            Add Episode
                        </Button>
                        <Button className="flex-grow-1" variant="contained" component="label">
                            Add Episodes
                            <input hidden accept="video/mp4" type="file" onChange={e => props.handleAddEpisodes(props.season + 1, episodes.length, e.target.files!)} multiple />
                        </Button>
                    </div>
                    <div className="d-flex">
                        <Button className="flex-grow-1" variant="contained" color="info" onClick={handleDetectEpisodeIntros}>
                            Detect All Intros
                        </Button>
                        <Button className="flex-grow-1" variant="contained" color="warning" onClick={() => handleConvertSeason()}>
                            Convert All to HLS
                        </Button>
                        <Button className="flex-grow-1" variant="contained" color="warning" onClick={() => handleConvertSeason(true)}>
                            Re-encode All to HLS
                        </Button>
                    </div>
                    {Object.keys(props.episodeUploadProgress).map((filename, i) => (
                        <React.Fragment key={i}>
                            <span>{filename}</span>
                            <progress value={props.episodeUploadProgress[filename]} max="100" />
                            <br/>
                        </React.Fragment>
                    ))}
                    <ul className="list-unstyled list-group">
                        {episodes.map((episode, i) => (
                            <li key={i} className="list-group-item">
                                <div className="d-flex flex-row">
                                    <h5 className="flex-grow-1">{episode.episode}: {episode.title}</h5>
                                    <Button variant="contained" color="warning" onClick={() => props.setSelectedEpisode(episode)}>Edit</Button>
                                    <Button variant="contained" color="error" onClick={() => handleDeleteEpisode(episode)}>Delete</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </Collapse>
        </div>
    )
}

interface EditSeriesProps{
    series: SeriesType;
    setSeries: (series: (prevState: SeriesType | null) => SeriesType | null) => void;
    setShowEdit: (show: boolean) => void;
}
function EditSeries(props: EditSeriesProps){
    const [title, setTitle] = React.useState<string>(props.series.title)
    const [year, setYear] = React.useState<number>(props.series.year || 0)
    const [description, setDescription] = React.useState<string>(props.series.description || "")
    const [language, setLanguage] = React.useState<string>(props.series.language || "")
    const [isVisible, setIsVisible] = React.useState<boolean>(props.series.is_visible || false)
    const [isNsfw, setIsNsfw] = React.useState<boolean>(props.series.is_nsfw || false)

    const [newThumbnail, setNewThumbnail] = React.useState<File | null | undefined>(null)
    const [newPoster, setNewPoster] = React.useState<File | null | undefined>(null)
    const [newIntro, setNewIntro] = React.useState<File | null | undefined>(null)

    const [introSkip, setIntroSkip] = React.useState<boolean>(props.series.intro_skip)
    const [introGlobal, setIntroGlobal] = React.useState<boolean>(props.series.intro_global)
    const [introStart, setIntroStart] = React.useState<number | null>(props.series.intro_start || 0)
    const [introLength, setIntroLength] = React.useState<number | null>(props.series.intro_length || 0)
    const [endcard, setEndcard] = React.useState<boolean>(props.series.endcard)
    const [endcardLength, setEndcardLength] = React.useState<number | null>(props.series.endcard_length || 0)

    const [newEpisode, setNewEpisode] = React.useState<{season: number, episode_count: number} | null>(null)
    const [selectedEpisode, setSelectedEpisode] = React.useState<EpisodeType | null>(null)

    const [episodeUploadProgress, setEpisodeUploadProgress] = React.useState<{[filename: string]: number}>({})

    function handleAddEpisodes(season: number, episode_count: number, episodes: FileList){
        interface UploadEpisode{
            file: File,
            season: number,
            episode: number
        }

        let uploadEpisodes: UploadEpisode[] = Array.from(episodes).map((episode, i) => ({
            file: episode,
            season,
            episode: episode_count + i + 1
        }))
        let semaphore = 0

        function upload(episode: UploadEpisode){
            const req = new XMLHttpRequest()
            const formData = new FormData()

            formData.append("season", episode.season.toString())
            formData.append("episode", episode.episode.toString())
            formData.append("episode_file", episode.file)

            req.upload.addEventListener("progress", e => {
                setEpisodeUploadProgress(pv => ({...pv, [episode.file.name]: e.loaded / e.total * 100}))
            })
            req.addEventListener("load", () => {
                props.setSeries(pv => pv !== null ? ({
                    ...pv,
                    episodes: [...pv.episodes, JSON.parse(req.responseText)]
                }) : null)
                setEpisodeUploadProgress(pv => {
                    delete pv[episode.file.name]
                    return {...pv}
                })
                semaphore--
            })
            req.open("POST", `/series/${props.series.uuid}/upload`)
            req.send(formData)
        }

        function queueUploads(){
            while(semaphore < 3 && uploadEpisodes.length > 0){
                let episode = uploadEpisodes.shift()
                if(episode){
                    upload(episode)
                    semaphore++
                }
            }
            if(uploadEpisodes.length > 0){
                setTimeout(queueUploads, 1000)
            }
        }
        queueUploads()
    }

    function handleAddSeason(){
        props.setSeries(pv => pv !== null ? ({
            ...pv,
            season_count: pv.season_count + 1
        }) : null)
    }

    function handleSave(){
        const formData = new FormData()
        formData.append("title", title)
        formData.append("year", year.toString())
        formData.append("description", description)
        formData.append("language", language)
        formData.append("is_visible", isVisible.toString())
        formData.append("is_nsfw", isNsfw.toString())
        formData.append("intro_skip", introSkip.toString())
        formData.append("intro_global", introGlobal.toString())
        formData.append("intro_start", introStart !== null ? introStart.toString() : "0")
        formData.append("intro_length", introLength !== null ? introLength.toString() : "0")
        formData.append("endcard", endcard.toString())
        formData.append("endcard_length", endcardLength !== null ? endcardLength.toString() : "0")

        if(newThumbnail) formData.append("thumbnail", newThumbnail)
        if(newPoster) formData.append("poster", newPoster)
        if(newIntro) formData.append("intro_audio", newIntro)

        fetch(`/series/${props.series.uuid}/edit`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then((data: SeriesType) => {
                props.setSeries(() => data)
                props.setShowEdit(false)
            })
    }

    function handleUpdateEpisode(setEpisode: ((prevState: EpisodeType) => EpisodeType)){
        setSelectedEpisode(pv => pv !== null ? setEpisode(pv) : null)
        props.setSeries(pv => pv !== null ? ({
            ...pv,
            episodes: (selectedEpisode === null || pv.episodes.filter(e => e.uuid !== selectedEpisode?.uuid).length === 0) ?
                [...pv.episodes, setEpisode(selectedEpisode!)] :
                pv.episodes.map(episode => episode.uuid === selectedEpisode!.uuid ? setEpisode(episode) : episode)
        }) : null)
    }

    return (
        <>
            <div hidden={!!selectedEpisode || !!newEpisode}>
                <TextField
                    variant="standard"
                    label="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    error={title.length === 0}
                    fullWidth
                />
                <TextField
                    variant="standard"
                    label="Year"
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value))}
                    error={Number.isNaN(year)}
                    fullWidth
                />
                <TextField
                    variant="standard"
                    label="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    multiline
                    fullWidth
                />
                <TextField
                    variant="standard"
                    label="Language Code"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    fullWidth
                />
                <FormControlLabel
                    control={<Checkbox
                            checked={isVisible}
                            onChange={e => setIsVisible(e.target.checked)}
                        />}
                    label="Is visible"
                />
                <FormControlLabel
                    control={<Checkbox
                            checked={isNsfw}
                            disabled={!hasNSFWPermission()}
                            onChange={e => setIsNsfw(e.target.checked)}
                        />}
                    label="Is NSFW"
                />
                <div className="d-flex">
                    <img style={{width: "40px", height: "40px"}} src={`/series/${props.series.uuid}?thumbnail`} alt="thumbnail" />
                    <Button className="flex-grow-1" variant="contained" component="label" fullWidth>
                        {newThumbnail ? "Change Selected Thumbnail" : "Upload Thumbnail"}
                        <input hidden accept="image/png" type="file" onChange={e => setNewThumbnail(e.target.files?.item(0))} />
                    </Button>
                </div>
                <div className="d-flex">
                    <img style={{width: "40px", height: "40px"}} src={`/series/${props.series.uuid}?poster`} alt="poster" />
                    <Button className="flex-grow-1" variant="contained" component="label" fullWidth>
                        {newPoster ? "Change Selected Poster" : "Upload Poster"}
                        <input hidden accept="image/png" type="file" onChange={e => setNewPoster(e.target.files?.item(0))} />
                    </Button>
                </div>

                <div className="row m-0 w-100">
                    <div className="col-6 p-0">
                        <FormControlLabel
                            control={<Checkbox
                                    checked={introSkip}
                                    onChange={e => setIntroSkip(e.target.checked)}
                                />}
                            label="Skip Intro"
                        />
                        <Fade in={introSkip}>
                            <FormControlLabel
                                control={<Checkbox
                                        checked={introGlobal}
                                        onChange={e => setIntroGlobal(e.target.checked)}
                                    />}
                                label="Gloabl Intro"
                            />
                        </Fade>
                        <div className="d-flex">
                            <Collapse in={introSkip && introGlobal} className="mb-3" unmountOnExit mountOnEnter>
                                <TextField
                                    variant="standard"
                                    label="Intro Start"
                                    value={introStart !== null ? introStart.toString() : ""}
                                    onChange={e => setIntroStart(parseInt(e.target.value))}
                                    error={Number.isNaN(introStart!)}
                                />
                            </Collapse>
                            <Collapse in={introSkip} className="mb-3">
                                <TextField
                                    variant="standard"
                                    label="Intro Length"
                                    value={introLength !== null ? introLength.toString() : ""}
                                    onChange={e => setIntroLength(parseInt(e.target.value))}
                                    error={Number.isNaN(introLength!)}
                                />
                            </Collapse>
                            <Collapse in={introSkip && !introGlobal} className="mb-3" unmountOnExit mountOnEnter>
                                <div className="d-flex">
                                    <audio controls src={`/series/${props.series.uuid}?intro_audio`} />
                                    <Button className="flex-grow-1" variant="contained" component="label" fullWidth>
                                        {newIntro ? "Change Selected Intro" : "Upload Intro"}
                                        <input hidden accept="audio/wav" type="file" onChange={e => setNewIntro(e.target.files?.item(0))} />
                                    </Button>
                                </div>
                            </Collapse>
                        </div>
                    </div>
                    <div className="col-6 p-0">
                        <FormControlLabel
                            control={<Checkbox
                                    checked={endcard}
                                    onChange={e => setEndcard(e.target.checked)}
                                />}
                            label="Endcard"
                        />
                        <Collapse in={endcard} className="mb-3">
                            <TextField
                                variant="standard"
                                label="Endcard Length"
                                value={endcardLength !== null ? endcardLength.toString() : ""}
                                onChange={e => setEndcardLength(parseInt(e.target.value))}
                                error={Number.isNaN(endcardLength!)}
                            />
                        </Collapse>
                    </div>
                </div>

                <Button variant="contained" onClick={handleAddSeason} fullWidth>
                    Add Season {props.series.season_count + 1}
                </Button>
                {[...Array(props.series.season_count)].map((_, season) => (
                    <SeasonOverview
                        key={season}
                        seriesProps={props}
                        season={season}
                        handleAddEpisode={(s, ec) => setNewEpisode({season: s, episode_count: ec})}
                        handleAddEpisodes={handleAddEpisodes}
                        episodeUploadProgress={episodeUploadProgress}
                        setSelectedEpisode={setSelectedEpisode}
                    />
                ))}

                <div className="d-flex flex-row float-end mt-5">
                    <Button variant="contained" onClick={() => props.setShowEdit(false)}>Close</Button>
                    <Button variant="contained" color="warning" onClick={handleSave}>Save</Button>
                </div>
            </div>
            {newEpisode && <AddEpisode
                series={props.series}
                setEpisode={handleUpdateEpisode}
                setClose={() => setNewEpisode(null)}
                currentSeason={newEpisode.season}
                currentEpisode={newEpisode.episode_count}
            />}
            {selectedEpisode && <EditEpisode
                series={props.series}
                episode={selectedEpisode}
                setEpisode={handleUpdateEpisode}
                setClose={() => setSelectedEpisode(null)}
                setSeries={props.setSeries as React.Dispatch<React.SetStateAction<SeriesType>>}
            />}
        </>
    )
}

export default EditSeries;
