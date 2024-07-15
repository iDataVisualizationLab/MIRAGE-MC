import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { useIntl } from 'react-intl';
import Page from "../../containers/Page/Page";
import {useDatabase} from "../../Providers/Database";
import {
    Backdrop,
    Box,
    Unstable_Grid2 as Grid,
    LinearProgress,
    Paper,
    Typography,
    Card,
    CardContent, Button, Stack, IconButton, Collapse
} from "@mui/material";
import Earth3D from "../../components/Earth";
import AutoSizer from "lp-react-virtualized-auto-sizer-react-18";

import EventTable from "../../components/EventTable/index";
import { Responsive as ResponsiveGridLayout, WidthProvider } from "react-grid-layout";
import UndoRedo from "../../containers/UndoRedo";
import {useDispatch, useSelector} from "react-redux";
import {
    setFilter,
    setFilters,
    selectFilters
} from "../../reducer/streamfilters";
import {semicolor} from "../../containers/LayoutContainer/theme";
import {useQuestions} from "material-ui-shell/lib/providers/Dialogs/Question";
import {SET_MENU} from "../../reducer/actions/setting";
import MinimizeIcon from '@mui/icons-material/Minimize';
import EventDetail from "../../components/EventDetail";
import useQuery from "../../Providers/Query";
import * as FlexLayout from "flexlayout-react";
import "./layout.css";
import {AddCircle, Brightness4 as Brightness4Icon, BrightnessHigh as BrightnessHighIcon} from "@mui/icons-material";
import EventMap from "../../components/EventMap";
import Search from "../../components/Search";
import MediaDetail from "../../components/MediaDetail";
import AppHeader from "../../components/AppHeader";
import {actionCreators} from "../../reducer/actions/selectedList";
import {fields, fieldsWithoutSelected} from "../../components/EventTable/fields";
import SongListDetail from "../../components/SongListDetail";
import {useLog} from "../../Providers/Firebase";
import {useLocation} from "react-router-dom";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

const LandingPage = () => {
    // const ResponsiveGridLayout = useMemo(()=>WidthProvider(Responsive),[]);
    const dispatch = useDispatch();
    const intl = useIntl();
    // const {openDialog,closeDialog, setProcessing} = useQuestions()
    const filters = useSelector(selectFilters);
    // const { appConfig } = useConfig()
    const {getList,isLoading,getEvents,requestEvents,requestDetail,getDetail,setFuncCollection} = useDatabase();
    const [zoomLoc,setZoomLoc] = useState();
    const [isFullView,setIsFullView] = useState(true);
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [layoutItems,setLayoutItems] = useState({
        Earth:{key:"Earth View",val:true,disable:true},
        eventList:{key:"Event List",val:true},
        eventDetail:{key:"Event Details",val:true},
        eventMap:{key:"Event List Map",val:true},
        mediaDetail:{key:"Listen",val:true},
        eventSelectedList:{key:"Selected Events",val:true},
        eventListDetail:{key:"Event List Details",val:true},
    });
    const toolbarRef = useRef(null);
    const layoutRef = useRef(null);
    const currentDetail = getDetail();
    const eventTotalData = useSelector(state => state.seletedList.currentList);
    const eventSelectedData = useSelector(state => Array.from(state.seletedList.items.values( ) ));
    const {setlocation, logEvents} = useLog();
    const query = useQuery();
    const location = useLocation();
    useEffect(()=>{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position)=>{
                setlocation(position.coords)
                setZoomLoc({lng:position.coords.longitude,lat:position.coords.latitude})
            }, ()=>{});
        }
        dispatch({ type: SET_MENU, opened: true });
    },[]);

    useEffect(()=>{
        if(currentDetail)
            setZoomLoc({lng:currentDetail.long,lat:currentDetail.lat})
    },[currentDetail])



    const isLoadingInit = isLoading('rawData');
    const isLoadingEvent = isLoading('events');
    const isLoadingLocs = isLoading('locs');
    const [firstLoad,setFirstLoad] = useState(true);
    useEffect(()=>{
        if (!isLoadingInit) {
            if (firstLoad){
                setFirstLoad(false);
                if (!(query && query.get("selected")))
                    requestEvents(filters, 1000);
            } else{
            requestEvents(filters, 1000);
        }
        }
    },[isLoadingInit,filters,firstLoad])
    const onSelectStream = useCallback((data)=>{
        requestDetail(data);
    },[getEvents])

    const onSelect = useCallback((value,extra)=>{
        if (extra)
            setZoomLoc({lng:extra.long,lat:extra.lat})
        if (Object.keys(value)[0]) {
            logEvents('click_earth', {...value})
        }
        dispatch(setFilters({value}));
    },[]);

    // const onTogleWin = useCallback((key)=>{
    //     setLayoutItems({...layoutItems,[key]:!layoutItems[key]});
    // },[layoutItems])

    // const generateLayout = (k)=>{
    //     switch (k){
    //         case 'eventList':
    //             return <EventTable data={getEvents()}
    //                                isLoadingData={isLoadingEvent}
    //                                onSelectRow={onSelectStream}
    //                                highlightId={currentDetail}
    //                                onTogleWin={()=>onTogleWin("eventList")}
    //             />
    //         case 'eventDetail':
    //             return <EventDetail currentDetail={currentDetail} onSelect={onSelect}
    //                                 events={getEvents()}
    //                                 locs={getList('locs')}
    //                                 sx={{height:'100%',position:'relative'}}
    //                                 onTogleWin={()=>onTogleWin("eventDetail")}
    //             />
    //         default:
    //             return ''
    //     }
    // }

    const [layouts,setLayouts] = useState(()=>FlexLayout.Model.fromJson({
        global: {
            // "splitterSize": 1,
            // "splitterExtra": 4,
            "tabEnableFloat": true,
            "tabSetMinWidth": 100,
            "tabSetMinHeight": 100,
            "borderMinSize": 100
        },
        borders:[
            {
                "type": "border",
                "location":"top",
                "size": 400,
                "active": true,
                "children": [
                ]
            },
            {
                "type": "border",
                "location":"left",
                "size": windowDimensions.width*0.4,
                "children": [
                    {
                        "type": "tab",
                        "name": "Earth View",
                        enableClose: false,
                        "component": "Earth"
                    }
                ],
                "selected": 0,
            }
        ],
        layout: {
            type: "row",
            weight: 100,
            children: [
                {"type": "row",
                    children: [
                        {"type": "row",
                            children: [
                                {
                                    type: "tabset",
                                    weight: 50,
                                    children: [
                                        {
                                            type: "tab",
                                            name: "Event List",
                                            component: "eventList",
                                        }
                                    ]
                                },
                                {
                                    type: "tabset",
                                    weight: 50,
                                    children: [
                                        {
                                            type: "tab",
                                            name: "Selected Events",
                                            component: "eventSelectedList",
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "tabset",
                            weight: 50,
                            children: [
                                {
                                    type: "tab",
                                    name: "Event Detail",
                                    component: "eventDetail",
                                },{
                                    type: "tab",
                                    name: "Listen",
                                    component: "mediaDetail",
                                },{
                                    type: "tab",
                                    name: "Event List Map",
                                    component: "eventMap",
                                },
                                {
                                    type: "tab",
                                    name: "Event List Detail",
                                    component: "eventListDetail",
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }));

    useEffect(()=>{
        dispatch(actionCreators.newList(getEvents()));
    },[getEvents()])

    const getSwitchView = useCallback((newval)=>{
        if (newval!==undefined)
            setIsFullView(newval);
        return isFullView;
    },[isFullView])
    const factory = (node) => {
        let component = node.getComponent();
        switch (component){
            case 'eventList':
                return <EventTable id='eventListTable'
                                   data={eventTotalData??[]}
                                   columns={fields}
                                   isLoadingData={isLoadingEvent}
                                   onSelectRow={onSelectStream}
                                   highlightId={currentDetail}
                                   totalData={eventTotalData}
                                   selectedData={eventSelectedData}
                                   onSendToList={(l)=>dispatch(actionCreators.addsToBasket(l))}
                                   onRemoveFromList={(l)=>dispatch(actionCreators.removeItems(l))}
                                   // onTogleWin={()=>onTogleWin("eventList")}
                                   mainurl={location}
                />;
            case 'eventListDetail':
                return <SongListDetail countries={isFullView?getList('countries_full'):getList('countries')}/>;
            case 'eventSelectedList':
                return <EventTable id='eventSelectedListTable'
                                   data={eventSelectedData}
                                   columns={fieldsWithoutSelected}
                                   isLoadingData={isLoadingEvent}
                                   onSelectRow={onSelectStream}
                                   highlightId={currentDetail}
                                   totalData={eventTotalData}
                                   selectedData={eventSelectedData}
                                   disableAdding={true}
                                   onSendToList={(l)=>dispatch(actionCreators.addsToBasket(l))}
                                   onRemoveFromList={(l)=>dispatch(actionCreators.removeItems(l))}
                                   // onTogleWin={()=>onTogleWin("eventList")}
                                   mainurl={location}
                />
            case 'eventMap':
                return <EventMap
                    currentDetail={currentDetail}
                    events={getEvents()}
                    locs={getList('locs')}
                />
            case 'eventDetail':
                return <EventDetail currentDetail={currentDetail} onSelect={onSelect}
                                    events={getEvents()}
                                    locs={getList('locs')}
                                    sx={{height:'100%',position:'relative'}}
                                    // onTogleWin={()=>onTogleWin("eventDetail")}
                />
            case 'mediaDetail':
                return <MediaDetail currentDetail={currentDetail} onSelect={onSelect}
                                    events={getEvents()}
                                    locs={getList('locs')}
                                    sx={{height:'100%',position:'relative'}}
                    // onTogleWin={()=>onTogleWin("eventDetail")}
                />
            case 'Earth':
                return <AutoSizer style={{ height: '100%', width: '100%' }} >
                    {({ height, width }) => {
                        return <Earth3D locs={isFullView?getList('locs_full'):getList('locs')}
                                        countries={isFullView?getList('countries_full'):getList('countries')}
                                        onSelect={onSelect}
                                        onSelectLegend={setFuncCollection}
                                        width={width} height={height}
                                        toolbarRef={toolbarRef}
                                        zoomLoc={zoomLoc}
                                        getSwitchView={getSwitchView}
                        />
                    }}
                </AutoSizer>
            default:
                return ''
        }
    }
    // const onRenderTabSet = (tabSetNode, renderValues) =>{
    //     // debugger
    //     if (!Object.keys(layoutItems).reduce((pre,k)=>pre && (layoutItems[k].val),true)) {
    //         renderValues.stickyButtons.push(<AddCircle
    //             color={'primary'}
    //             title= "Add"
    //             key= "Add button"
    //             className={"flexlayout__tab_toolbar_button"}
    //             style={{width: "1.1em", height: "1.1em"}}
    //         />)
    //         // renderValues.stickyButtons.push(React.createElement("img", {
    //         //     src: "images/add.svg",
    //         //     alt: "Add",
    //         //     key: "Add button",
    //         //     title: "Add Tab (using onRenderTabSet callback, see Demo)",
    //         //     style: {width: "1.1em", height: "1.1em"},
    //         //     className: "flexlayout__tab_toolbar_button",
    //         //     // onClick: function () { return _this.onAddFromTabSetButton(node); }
    //         // }));
    //     }
    // }
    const layoutItemsOnChange = useCallback((key,item,isOn)=>{
        debugger
        if (layoutRef.current)
        {
            if (isOn)
                layoutRef.current.addTabToActiveTabSet({
                    name: item.key,
                    component: key,
                });
            else{
                // layouts
                // find id
                const current = Object.keys(layouts._idMap).find(k=>layouts._idMap[k]._attributes.component===key)
                if (current)
                    layouts.doAction(FlexLayout.Actions.deleteTab(current))
            }
            layoutItems[key].val = isOn;
            setLayoutItems({...layoutItems});
        }
    },[layoutRef,layouts])
    return (<Page
            appBarLeftContent={<AppHeader layoutItems={layoutItems} layoutItemsOnChange={layoutItemsOnChange}/>}
            appBarContent={<>
            <Search/>
            <div ref={toolbarRef}></div>
            <UndoRedo/>
        </>
    }>
            {/*<div style={{position:'absolute',top:0,left:0, zIndex:0, height: '100%', width: '100%', overflow:'hidden'}}>*/}
            {/*    <AutoSizer style={{ height: 'calc(100vh - 64px)', width: '100%' }} >*/}
            {/*        {({ height, width }) => {*/}
            {/*            return <Earth3D locs={getList('locs')}*/}
            {/*                            countries={getList('countries')}*/}
            {/*                            onSelect={onSelect}*/}
            {/*                            onSelectLegend={setFuncCollection}*/}
            {/*                            width={width} height={height}*/}
            {/*                            toolbarRef={toolbarRef}*/}
            {/*                            zoomLoc={zoomLoc}*/}
            {/*            />*/}
            {/*        }}*/}
            {/*    </AutoSizer>*/}
            {/*</div>*/}
        <div style={{height: '100%', position:'relative', pointerEvents:'all', overflow:'hidden'}}>
            <FlexLayout.Layout model={layouts}
                               ref={layoutRef}
                               factory={factory}
                               tabEnableRenderOnDemand={false}
                               // onRenderTabSet={onRenderTabSet}
                               popoutURL="#/popout"
                               realtimeResize={false}
                               onModelChange={(m)=>{
                                   // check tab
                                   Object.keys(layoutItems).forEach(k=>layoutItems[k].val=false);
                                   // m._root._children.forEach(m=>m._children.forEach(m=> {
                                   //     if (m._attributes.component&&layoutItems[m._attributes.component])
                                   //         layoutItems[m._attributes.component].val = true
                                   //     else
                                   //          m._children.forEach(m => layoutItems[m._attributes.component]?(layoutItems[m._attributes.component].val = true):'')
                                   // }));
                                   // m._borders._borders.forEach(m=>m._children.forEach(m=>layoutItems[m._attributes.component].val=true));
                                   Object.values(m._idMap).forEach(m=> {
                                       if (m._attributes.component&&layoutItems[m._attributes.component])
                                           layoutItems[m._attributes.component].val = true
                                   })
                                   setLayoutItems(layoutItems)
                                   setLayouts(m)
                               }}
            />

            {/*<AutoSizer style={{ minHeight: '100%', width: '100%', position:'relative' }} >*/}
            {/*    {({ height, width }) => {*/}
            {/*        return <ResponsiveGridLayout className="layout" cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}*/}
            {/*                      layouts={layouts}*/}
            {/*                     onBreakpointChange={onBreakpointChange}*/}
            {/*                     onLayoutChange={onLayoutChange}*/}
            {/*                      preventCollision={true}*/}
            {/*                      compactType={null}*/}
            {/*                      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}*/}
            {/*                     margin={{ lg: [10,10], md: [10,10], sm: [10,10], xs: [10,10], xxs: [10,10] }}*/}
            {/*                         width={width}*/}
            {/*                         rowHeight={(height-20)/10 -10}*/}
            {/*                         height={height}*/}
            {/*                      style={{position:'relative',height:height, pointerEvents:'all'}} >*/}
            {/*            {*/}
            {/*                Object.keys(layoutItems).map(k=>layoutItems[k]?<div key={k} style={{pointerEvents:'all'}}>*/}
            {/*                    {generateLayout(k)}*/}
            {/*                </div>:'')*/}
            {/*            }*/}
            {/*</ResponsiveGridLayout>}}*/}
            {/*</AutoSizer>*/}
        </div>
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={(isLoadingInit||isLoadingLocs)}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', width:'50%', flexDirection: "column", textAlign:'center' }}>
                <Box sx={{ width: '100%' }}>
                    <LinearProgress variant="determinate" value={(isLoadingInit)?40:((isLoadingLocs)?90:100)} />
                </Box>
                <Box sx={{ width: '100%' }}>
                    <h2>{(isLoadingInit)?'Read data....':((isLoadingLocs)?'Process data...':'Done!')}</h2>
                </Box>
            </Box>
        </Backdrop>
    </Page>
    )
}

export default LandingPage;