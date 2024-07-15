import React, { useState, Fragment } from 'react'
import QuestionDialog from '../../components/Dialog'
import { useDispatch, useSelector } from 'react-redux';
import {SET_MENU} from "../../reducer/actions/setting";
import {Link, Stack, Typography} from "@mui/material";
import {Image} from "@mui/icons-material";
import spotifylogo from "../../assets/spotifylogo.png"


const AboutDialog = ({ children }) => {
    const dispatch = useDispatch();
    const dialogOpen = useSelector((state) => state.customization.opened);
    const [isProcessing, setIsProcessing] = useState(false)

    const closeDialog = () => {
        dispatch({ type: SET_MENU, opened: !dialogOpen });
    }
    // console.log('I am CCCCCCCCC')
    return (
        <Fragment>
            {children}
            <QuestionDialog
                isOpen={dialogOpen}
                handleClose={closeDialog}
                isProcessing={isProcessing}
                title={''}
                maxWidth={"md"}
                message={<>
                    <Typography variant={"h5"} sx={{marginBottom:2}}>
                        Welcome to the Music Informatics for Radio Across the GlobE (MIRAGE) project! The first development release (v{process.env.REACT_APP_DATA_APP_VERSION}) of this online dashboard allows you to access, interact with, and export meta data and musicological features from the music found on internet radio.


                    </Typography>
                    <Typography variant={"h5"} sx={{marginBottom:2}}>
                        The MIRAGE dashboard (v{process.env.REACT_APP_DATA_APP_VERSION}) consists of meta data (e.g., artist name, event title, etc.) for one million songs or events that were streaming on the Radio Garden streaming service during the months October-January 2022-2023. Each of 86 meta data variables pertaining to the location, station, stream, artist, and track was obtained from either the Radio Garden API, the internet radio station stream encoder, review by human annotators, or the Spotify and Wikidata APIs.
                    </Typography>
                    <Typography variant={"h5"} sx={{marginBottom:1}}>
                    If you are a copyright owner for any of the metadata that appears in MIRAGE and would like us to remove your metadata, please contact the developer team at the following email address: {"<removed for anonymous review>"}
                    </Typography>
                    <Typography variant={"h5"} sx={{marginBottom:1}}>
                        If you plan to use any of the data or visualizations available on the MIRAGE dashboard, please cite the following publication:  
                    </Typography>
                    <Typography variant={"h5"} sx={{marginBottom:2,marginLeft:2}}>
                        {"<if accepted, the citation will be provided here>"}
                    </Typography>
                    <Stack direction={"row"} width={'100%'} spacing={2} justifyContent={'center'}>
                        <img
                            width={150}
                            srcSet={'https://yellow.radio/wp-content/uploads/2020/04/unnamed.png'}
                            src={'https://yellow.radio/wp-content/uploads/2020/04/unnamed.png'}
                            alt={'Spotify logo'}
                            loading="lazy"
                        />
                        <img
                            width={150}
                            srcSet={spotifylogo}
                            src={spotifylogo}
                            alt={'Spotify logo'}
                            loading="lazy"
                        />
                        <img
                            width={150}
                            srcSet={'https://upload.wikimedia.org/wikipedia/commons/c/cd/Wikidata_stamp.png'}
                            src={'https://upload.wikimedia.org/wikipedia/commons/c/cd/Wikidata_stamp.png'}
                            alt={'Wikidata stamp'}
                            loading="lazy"
                        />
                    </Stack>
                </>}
            />
        </Fragment>
    )
}

export default AboutDialog