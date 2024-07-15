import React, { useEffect } from "react";
import {Stack, MenuItem, Select,FormControl, TextField, IconButton} from "@mui/material";
import CancelIcon from '@mui/icons-material/Cancel';
import CusAutocomplete from "./CusAutocomplete";
import ListboxComponent from "../ListboxComponent";
import { useSelector, useDispatch } from "react-redux";
import {
    setFilter,
    deleteFilter,
    selectFilters
} from "../../reducer/streamfilters";

const emptyArray = [];
const emptyObj = {};
const emptyFunc = ()=>{};
export default function SelectionWithOption({options=emptyArray,
    enabled=emptyObj,  filterOptionsFunc,
    cat='',
    filterOptions,searchByStream,
    getList, isLoading, logEvents}) {
    const [f, setF] = React.useState({});
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);

    useEffect(()=>{
        if (cat!=='')
            setF(options.find(d=>d.accessorKey===cat));
    },[cat])

    const handleChange = (event) => {
        dispatch(setFilter({key:event.target.value,value:[],prekey:cat}));
    };

    const onDelete = () =>{
        dispatch(deleteFilter({key:cat}));
    }
    return <React.Fragment>
    <Stack direction={"row"}>
    <FormControl sx={{ minWidth: 120 }}>
        <Select
          value={cat}
          onChange={handleChange}
          size="small"
        >
            {options.map((d)=><MenuItem value={d.accessorKey} key={d.accessorKey} disabled={enabled[d.accessorKey]}>
                {d.header}
                </MenuItem>)
            }
        </Select>
      </FormControl>
      <CusAutocomplete
            disabled={cat===''}
            fullWidth
            key={f.accessorKey}
            multiple
            size="small"
            limitTags={2}
            filterOptions={filterOptionsFunc}
            ListboxComponent={ListboxComponent}
            freeSolo
            options={(f.dynamic?getList(`search-${f.accessorKey}`):filterOptions[f.accessorKey])??[]}
            loading={f.dynamic?isLoading(`search-${f.accessorKey}`):false}
            getOptionLabel={(d) => d}
            value={filters[f.accessorKey]??[]}
            onChange={(event, value) => {
                if (value!=='' && value && value.length)
                    logEvents('search',{'search_term':value,key:f.accessorKey,})
                dispatch(setFilter({key:f.accessorKey,value}));
            }}
            onInputChange={f.dynamic?((event, newInputValue) => {
                if (newInputValue&&newInputValue!=='')
                    searchByStream(f.accessorKey,newInputValue,f.cat);
            }):undefined}
            renderInput={(params) => (
                <TextField
                    {...params}
                    // label={f.header}
                />
            )}
        />
        {(cat!=='')&&<IconButton aria-label="close" size="small" onClick={onDelete}>
            <CancelIcon fontSize="inherit" />
        </IconButton>}
    </Stack>
    </React.Fragment>
}