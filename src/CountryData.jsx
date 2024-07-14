import world from "./world.json";
import "./App.css";

export default function CountryData(props) {
    const countryObj = world.features.find(c => c.properties.name === props.countryName);

    return <div id="countryData">
        <h1 id="infoTitle">Country data: <br></br><b>{props.countryName}</b></h1>
        
        <h2><br></br>Capital: {countryObj.properties.capital}</h2>
        <h2>Language: {countryObj.properties.language}</h2>

        <h2><br></br>Population: {countryObj.properties.population.toLocaleString().replaceAll(",", ".")}</h2>
        <h2>Currency: {countryObj.properties.currency}</h2>
    </div>
}