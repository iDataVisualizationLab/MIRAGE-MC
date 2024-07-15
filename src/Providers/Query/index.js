import {useLocation} from "react-router-dom";
import {useDatabase} from "../Database";
import {useMemo} from "react";

export default function useQuery() {
    const { search } = useLocation();
    const {requestDetail, getDataFromShortenLink} = useDatabase();
    return useMemo(() => {
        const queryObject = new URLSearchParams(window.location.href.split('?')[1]);
        if (queryObject.get("selected")) {
            getDataFromShortenLink(queryObject.get("selected"));

            return queryObject;
        }
        if (queryObject.get("id")) {
            requestDetail({_id: queryObject.get("id")});
            return queryObject;
        }
    }, [search]);
    
}