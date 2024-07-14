import axios from 'axios';
import "./App.css";
import { useState, useEffect } from 'react';

export default function LandmarkData(props) {
    const [landmarkData, setLandmarkData] = useState(null);
    const [loc, setLoc] = useState(""); const [city, setCity] = useState("");

    useEffect(() => {
        const fetchLandmarkData = async () => {
            try {
                const response = await axios({
                    method: "get",
                    url: `http://api.opentripmap.com/0.1/en/places/xid/${props.xid}`,
                    params: {
                        apikey: "5ae2e3f221c38a28845f05b650bf172d8f27ae520fc0a943b5645af6"
                    }
                });
                
                const data = response.data;
                setLandmarkData(data);
                
                if (data.address.city) setLoc(data.address.city);
                else if (data.address.town) setLoc(data.address.town);
                else if (data.address.village) setLoc(data.address.village);
                else if (data.address.suburb) setLoc(data.address.suburb);
                else setLoc("");

                if (data.address.county) setCity(data.address.county);
                else if (data.address.state) setCity(data.address.state);
                else if (data.address.city_district) setCity(data.address.city_district);
                else setCity("");
            } catch (error) {}
        };
        fetchLandmarkData();   
    }, [props.xid]);

    if (!landmarkData) return <div>Loading...</div>;
    return (
        <div id="landmarkData">
            <img src={landmarkData.preview.source} alt={landmarkData.name}/>
            <h1 id="infoTitle"><b>{landmarkData.name}</b></h1>
            <h2>City: {loc}{loc && ","} {city}</h2>
            <p>{landmarkData.wikipedia_extracts.text}</p>
        </div>
    );
}
