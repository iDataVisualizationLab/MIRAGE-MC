import React, {useCallback, useEffect, useReducer} from 'react'
import Context from './Context'
import {groups as d3groups, sum as d3sum, mean as d3mean, csv as d3csv} from "d3"
import {isArray, uniq} from 'lodash';
import full_countries from './data/mirage-mc-v1.countries.json';
import full_location from './data/mirage-mc-v1.locs.json';
import axios from 'axios';

const APIKey = process.env.REACT_APP_DATA_API;
const APIUrl = ((process.env.NODE_ENV === 'production') ? process.env.REACT_APP_DATA_URL : process.env.REACT_APP_DATA_URL_LOCAL);

axios.defaults.headers.common = {
    "api-key": APIKey,
};

const emptyArray = [];

function reducer(state, action) {
    const { type, path, isLoading=false,error = false,
        hasError = false, value } = action;
    switch (type) {
        case "LOADING_CHANGED":
            return { ...state, [path]: { ...state[path], isLoading } };
        case "VALUE_CHANGE":
            return {
                ...state,
                [path]: { ...state[path], value, isLoading, error, hasError },
            };
        case "INIT":
            return {...state,isInit:value}
        default:
            console.log(type)
            return state
            // throw new Error()
    }
}


const init = {fields: {value:{stationData:[],
            locationData:[]}},
    locs:{},
    countries:{},
    locs_full: {value:full_location},
    countries_full: {value:full_countries},
    events: {},
    loading:false,
    error:false,
    isInit:false
}

const emptyFunc = ()=>{}
const Provider = ({  children }) => {
    const [state, dispatch] = useReducer(reducer, init);
    useEffect(() => {
        const controllerS = new AbortController();
        const controllerL = new AbortController();

        try {
            console.time('Load and process data');
            console.time('-Load data-');
            // dispatch({type: 'LOADING_CHANGED', path: 'rawData', isLoading: true});
            dispatch({type: 'LOADING_CHANGED', path: 'locs', isLoading: true});
            dispatch({type: 'LOADING_CHANGED', path: 'countries', isLoading: true});
            dispatch({type: 'LOADING_CHANGED', path: 'fields', isLoading: true});
            // load data
            Promise.all([
                axios.get(`${APIUrl}/station/city`,{
                    signal: controllerS.signal
                }).then(({data})=> {
                    return data
                }),
                // axios.get(`${APIUrl}/station/country/`,{
                //     signal: controllerL.signal
                // }).then(({data})=>data),
                axios.get(`${APIUrl}/station/fields/`,{
                    signal: controllerL.signal
                }).then(({data})=>data),
                axios.get(`${APIUrl}/location/fields/`,{
                    signal: controllerL.signal
                }).then(({data})=>data),
                axios.get(`${APIUrl}/location/`,{
                    signal: controllerL.signal
                }).then(({data})=>data),
            // ]).then(([locs, countries,stationFields,locationFields]) => {
            ]).then(([_city,stationFields,locationFields,locationData]) => {
                console.timeEnd('-Load data-');
                const byLocName={}
                locationData.forEach(d => {
                    // d.lat = (+d.longitude);
                    // d.long = (+d.latitude);
                    d.long = (+d.longitude);
                    d.lat = (+d.latitude);
                    delete d.longitude;
                    delete d.latitude;
                    byLocName[d['city_id']] = d;
                });
                const locs = _city.map(d => {
                    const locinfo = byLocName[d._id]??{};
                    return {
                        ...locinfo,
                        "title": `${locinfo.city} - ${locinfo.country}`,
                        count: d.count
                    }
                });
                const countries = d3groups(locs, d => d["country"]).map(d => {
                    return {
                        "title": d[0],
                        long: d3mean(d[1], e => e.long),
                        lat: d3mean(d[1], e => e.lat),
                        count: d3sum(d[1],e=>e.count),
                        // values: d[1]
                    }
                });
                // console.time('-Correct data-');
                // const locationDataMap = {};
                // locationData.forEach(d => {
                //     d.lat = (+d.longitude);
                //     d.long = (+d.latitude);
                //     delete d.longitude;
                //     delete d.latitude;
                //     locationDataMap[d['city_id']] = d;
                // });
                // let stationDataMap = {};
                // stationData.forEach(d => {
                //     d.lat = locationDataMap[d['city_id']].lat;
                //     d.long = locationDataMap[d['city_id']].long;
                //     d.country = locationDataMap[d['city_id']].country;
                //     d.city = locationDataMap[d['city_id']].city;
                //     stationDataMap[d['station_id']] = d;
                // });
                // const rawData = {stationData, locationData,stationDataMap,locationDataMap};
                // dispatch({type: 'VALUE_CHANGE', path: 'rawData', value: rawData, isLoading: false,});
                // console.timeEnd('-Correct data-');
                // console.time('-filterdata-');
                // const {locs, countries} = handleData(rawData);
                const fields = {...stationFields,...locationFields}
                // console.log(fields.city)
                // Object.keys(fields).forEach(k=>fields[k].sort())
                countries.sort((a, b) => b.count - a.count)
                locs.sort((a, b) => b.count - a.count)

                dispatch({type: 'VALUE_CHANGE', path: 'locs', value: locs, isLoading: false});
                dispatch({type: 'VALUE_CHANGE', path: 'countries', value: countries, isLoading: false});
                dispatch({type: 'VALUE_CHANGE', path: 'fields', value: fields, isLoading: false});
                // console.timeEnd('-filterdata-');
                console.timeEnd('Load and process data');
            });
        } catch (error) {
            dispatch({
                type: "ERROR",
                path: 'locs',
                isLoading: false,
                error,
                hasError: true,
            });
            dispatch({
                type: "ERROR",
                path: 'countries',
                isLoading: false,
                error,
                hasError: true,
            });
            dispatch({
                type: "ERROR",
                path: 'fields',
                isLoading: false,
                error,
                hasError: true,
            });
        }
        return ()=>{
            console.log('destroy!!!')
            controllerS.abort();
            controllerL.abort();
        }
    }, []);

    const getListError = useCallback(
        (path) => {
            return state[path] ? state[path].error : false;
        },
        [state]
    );
    const getList = useCallback(
        (path) => {
            return (state[path] && state[path].value) ? state[path].value : [];
        },
        [state]
    );

    // get list of field
    const getDistinctField = useCallback(
        (field) => {
            return state.fields && state.fields.value[field] ? state.fields.value[field] : [];
        },
        [state]
    );
    const searchByStream = (path,query,cat='stream')=>{
        dispatch({type: 'LOADING_CHANGED', path: `search-${path}`, isLoading: true});
        return axios.post(`${APIUrl}/${cat}/search`,{[path]:query}).then(({data})=> {
            dispatch({type: 'VALUE_CHANGE', path: `search-${path}`, value: data.map(d=>d._id), isLoading: false});
        }).catch ((error)=> {
            dispatch({
                type: "ERROR",
                path: `search-${path}`,
                isLoading: false,
                error,
                hasError: true,
            });
        })
    }
    const getEvents = useCallback(
        () => {
            return (state.events && state.events.value ? state.events.value : emptyArray);
        },
        [state.events.value]
    );
    const requestEvents = useCallback(
        (filter,limit) => {
            dispatch({type: 'LOADING_CHANGED', path: 'events', isLoading: true});
            axios.post(`${APIUrl}/meta/`, {filter}).then(({data})=> {
                dispatch({type: 'VALUE_CHANGE', path: 'events', value:data??[], isLoading: false});
            }).catch(error=>{
                dispatch({
                    type: "ERROR",
                    path: `events`,
                    isLoading: false,
                    error,
                    hasError: true,
                });
            })
        },
        [state]
    );
    const requestDetail = useCallback(
        (data) => {
            dispatch({type: 'LOADING_CHANGED', path: 'detail', isLoading: true});
            axios.get(`${APIUrl}/meta/${data._id}`).then(({data})=> {
                // flat data
                if (data) {
                    ['stream_info', 'location_info', 'station_info'].forEach(k => {
                        Object.keys(data[k]).forEach(subk => subk !== '_id' ? (data[subk] = data[k][subk]) : null);
                        delete data[k];
                    });
                    // data.lat = data.longitude;
                    // data.long = data.latitude;
                    data.long = data.longitude;
                    data.lat = data.latitude;
                    delete data.longitude;
                    delete data.latitude;
                    dispatch({type: 'VALUE_CHANGE', path: 'detail', value: data, isLoading: false});
                }else{
                    dispatch({
                        type: "ERROR",
                        path: `detail`,
                        isLoading: false,
                        error:'Not found',
                        hasError: true,
                    });
                }
            }).catch(error=>{
                dispatch({
                    type: "ERROR",
                    path: `detail`,
                    isLoading: false,
                    error,
                    hasError: true,
                });
            })
        },
        [state]
    );
    const getDetail = useCallback(
        () => {
            return (state.detail && state.detail.value ? state.detail.value : null);
        },
        [state]
    );
    function getExtra (r,stationDataMap,locationDataMap,streamDetail){
        return {
            ...r,
            station_description:stationDataMap[r['station_id']].station_description,
            station_url:stationDataMap[r['station_id']].station_url,
            lat:locationDataMap[r['city_id']].lat,
            long:locationDataMap[r['city_id']].long,
            url:stationDataMap[r['station_id']].url,
            // track_name:streamDetail[r['event_id']].track_name,
            ...streamDetail[r['event_id']]
        }
    }
    const getDownloadData = useCallback((listids)=>{
        return axios.post(`${APIUrl}/meta/`,{id:listids.map(d=>d._id),download:true}).then(({data})=> {
            return data;
        })
    },[state]);
    
    const getShortenLink = useCallback((data)=>{
        return axios.post(`${APIUrl}/url/`,{data}).then(({data})=> {
            return window.location.href+"selected="+data._id;
        })
    },[state]);

    const getDataFromShortenLink = useCallback((id)=>{
        return axios.get(`${APIUrl}/url/${id}`).then(({data})=> {
            return data;
        })
    },[state]);

    const setFuncCollection = useCallback((path,func=emptyFunc)=>{
        dispatch({type: 'VALUE_CHANGE', path, value: func, isLoading: false});
    },[state])

    const getFuncCollection = useCallback(
        (path) => {
            return (state[path] && state[path].value ? state[path].value : emptyFunc);
        },
        [state]
    );

    const isLoading = useCallback(
        (path) => {
            return state[path] ? state[path].isLoading : false;
        },
        [state]
    );
    return (
        <Context.Provider value={{
            getList,
            getEvents,
            requestEvents,
            getDistinctField,
            searchByStream,
            setFuncCollection,
            getFuncCollection,
            getDetail,
            requestDetail,
            getListError,
            getDownloadData,
            getShortenLink,
            getDataFromShortenLink,
            isLoading
        }}>
            {children}
        </Context.Provider>
    )
}

export default Provider;