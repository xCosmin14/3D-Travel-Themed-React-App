import airports from "./airports.json";

export default function AirportData(props) {
    const airportObject = airports.airports.filter(airport => airport.name == props.name);

    return <div id="airportData">
        <h1 id="infoTitle"><b>{props.name} Airport</b></h1>
        <h2>City: {airportObject[0].city}</h2>
        <h2>Lng: {airportObject[0].coords.lng}<br></br>Lat: {airportObject[0].coords.lat}</h2>    
    </div>
}