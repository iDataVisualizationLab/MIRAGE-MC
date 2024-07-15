import React from "react";
import {Autocomplete} from "@mui/material";
export default function CusAutocomplete ({onInputChange=()=>{},...props}) {
    const [input, setInput] = React.useState('');
    return <Autocomplete
        inputValue={input}
        onInputChange={(event,newValue,reason)=> {
            setInput(newValue);
            onInputChange(event,newValue,reason)
        }}
        onBlur={()=>{setInput('')}}
        {...props}
    />
}