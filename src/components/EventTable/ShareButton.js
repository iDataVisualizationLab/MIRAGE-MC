import {Button, TextField} from "@mui/material";
import React, {Fragment, useState} from "react";
import QuestionDialog from '../../components/Dialog';
import {SET_MENU} from "../../reducer/actions/setting";

export default function ShareButton({getUrl}){
    const [dialogOpen,setDialogOpen] = useState(false);
    const [url,setUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false)

    const closeDialog = () => {
        setDialogOpen(false);
    }
    const openDialog = () => {
        setUrl(getUrl());
        setDialogOpen(true);
    }
    return <Fragment>
    <Button variant="contained" onClick={openDialog}>Share</Button>
    <QuestionDialog
        isOpen={dialogOpen}
        handleClose={closeDialog}
        isProcessing={isProcessing}
        title={'Share URL'}
        maxWidth={"md"}
        message={<>
            <TextField 
                label="shareURL" 
                variant="outlined" 
                InputProps={{
                    readOnly: true,
                }}
                value={url}
            />
        </>}
    />
    </Fragment>
}