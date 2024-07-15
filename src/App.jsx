import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import axios from "axios";

import world from "./world.json";
import airports from "./airports.json";

import CountryData from "./CountryData.jsx";
import AirportData from "./Airport.jsx";
import LandmarkData from "./LandmarkData.jsx";
import setCategory from "./SetCategory.jsx";

import magnifyingGlass from "./assets/Magnifying glass.png";
import AirportPinpoint from "./assets/AirportPinpoint.png";
import StarsVideo from "./assets/Stars.mp4";

import "./App.css";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const [countrySearchField, setCountrySearchField] = useState("");

  const [selectedCountry, setSelectedCountry] = useState(params.get("country") ? params.get("country") : null);
  const [activeAirport, setActiveAirport] = useState(params.get("airport") ? params.get("airport") : null);
  const [activeLandmark, setActiveLandmark] = useState(params.get("landmark") ? params.get("landmark") : null);
  var landmarks = [];

  const mapRef = useRef(null);
  const projectionRef = useRef(null); const zoomRef = useRef(d3.zoomIdentity); 
  const pathRef = useRef(null); const svgRef = useRef(null);
  
  let masterCentroid = ["null (select a country)", "null (select a country)"];
  let countryCoordsArray = [[],[]];

  if (selectedCountry) {
    const country = world.features.find(c => c.properties.name === selectedCountry);
    const name = country.properties.name;
    masterCentroid = d3.geoCentroid(country); 
    d3.select(`[name="${name}"]`).attr("class", "active");

    fetchLandmarks(country);
  }

  const handleOutsideClick = (e) => {
    if (e.target.id !== "country" && e.target.id !== "searchBox" 
      && e.target.id !== "resetZoom" && e.target.id !== "airport" && e.target.id !== "landmark") {
      document.querySelector(".active") && document.querySelector(".active").setAttribute("class", "");
      setSelectedCountry("");
      setActiveAirport(""); params.delete("airport");
      setActiveLandmark(""); params.delete("landmark");
      updateAirports(""); updateLandmarks(""); landmarks = [];
      document.querySelector(".landmarks") && document.querySelector(".landmarks").remove();
      document.querySelector(".airports") && document.querySelector(".airports").remove();
      window.history.replaceState({}, "", `${window.location.pathname}`);
      countryCoordsArray = [[],[]];
    }  
  };
  document.addEventListener("click", handleOutsideClick);

  function rotationAnimation(coord1, coord2, countryName) {
    d3.transition().duration(650).tween("rotate", function () {
      const r = coord2 ? d3.interpolate(projectionRef.current.rotate(), [coord1, coord2]) : 
      d3.interpolate(projectionRef.current.rotate(), coord1);

      return function (t) {
        projectionRef.current.rotate(r(t));
        svgRef.current.selectAll("path").attr("d", pathRef.current.projection(projectionRef.current));
        updateAirports(countryName); updateLandmarks(countryName);
      };
    });
  }

  function resetRotation() {
    setActiveAirport(""); setActiveLandmark("");
    countryCoordsArray = [[],[]];

    rotationAnimation([0, -30], null, null);
  }

  function resetZoom() {
    document.getElementById("box").style.width = "46%";
    document.getElementById("box").style.height = "90%";
    document.getElementById("box").style.bottom = "25px";
    document.getElementById("box").style.top = "unset";

    d3.transition().duration(650).tween("zoom", function() {
      const currentScale = projectionRef.current.scale();
      const i = d3.interpolate(currentScale, 450);

      return function(t) {
        const scale = i(t);
        projectionRef.current.scale(scale);
        svgRef.current.selectAll("path").attr("d", pathRef.current.projection(projectionRef.current));
        svgRef.current.selectAll("circle").attr("r", scale);

        document.getElementById("box").style.width = document.querySelector("circle").getBoundingClientRect().width + "px";
        document.getElementById("box").style.height = document.querySelector("circle").getBoundingClientRect().width + "px";
        updateAirports(selectedCountry); updateLandmarks(selectedCountry);
      };
    });
  }
  
  function updateAirports(cName) {
    svgRef.current.selectAll(".airports").remove();

    const airportGroup = svgRef.current.append("g").attr("class", "airports");
    const filteredAirports = airports.airports.filter(airport => airport.country == cName);
    
    airportGroup.selectAll("image").data(filteredAirports).enter()
    .append("image").attr("xlink:href", AirportPinpoint)
    .attr("id", "airport").attr("name", d => d.name)
    .attr("width", 5*zoomRef.current.k).attr("height", 5*zoomRef.current.k)
    .on("click", function(event, d) {
      document.querySelector(".activeAirport") && document.querySelector(".activeAirport").removeAttribute("class");
      d3.select(this).attr("class", "activeAirport");
      setActiveAirport(d.name); setActiveLandmark(""); 
      params.delete("landmark"); params.set("airport", d.name);
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    })
    .attr("transform", d => {
      const coords = projectionRef.current([d.coords.lng, d.coords.lat]);
      return `translate(${coords[0] - 3.5*zoomRef.current.k}, ${coords[1] - 2*zoomRef.current.k})`;
    });
  }

  function updateLandmarks(cName) {
    svgRef.current.selectAll(".landmarks").remove();
    const landmarkGroup = svgRef.current.append("g").attr("class", "landmarks");
    
    landmarkGroup.selectAll("image").data(landmarks).enter()
      .append("image").attr("xlink:href", d => {
        const categoryPath = setCategory(d.properties.kinds);
        return categoryPath;
      })
      .attr("id", "landmark").attr("name", d => d.properties.name)
      .attr("width", 4 * zoomRef.current.k).attr("height", 4 * zoomRef.current.k)
      .on("click", function(event, d) {
        document.querySelector(".activeLandmark") && document.querySelector(".activeAirport").removeAttribute("class");
        d3.select(this).attr("class", "activeLandmark");
        setActiveAirport(""); setActiveLandmark(d.properties.xid); 
        params.delete("airport"); params.set("landmark", d.properties.xid);
        window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
      })
      .attr("transform", d => {
        const coords = projectionRef.current([d.geometry.coordinates[0], d.geometry.coordinates[1]]);
        return `translate(${coords[0]}, ${coords[1]})`;
      });
  }

  function fetchLandmarks(countryObject) {
    const coordinatesArray = countryObject.geometry.coordinates;

    if (countryObject.geometry.type === "Polygon") {
      coordinatesArray.forEach(polygon => {
        polygon.forEach(coordinate => {
          countryCoordsArray[0].push(coordinate[0]);
          countryCoordsArray[1].push(coordinate[1]);
        });
      });
    } else {
      coordinatesArray.forEach(multiPolygon => {
        multiPolygon.forEach(polygon => {
          polygon.forEach(coordinate => {
            countryCoordsArray[0].push(coordinate[0]);
            countryCoordsArray[1].push(coordinate[1]);
          });
        });
      });
    }

    axios({
      method: "get",
      url: "http://api.opentripmap.com/0.1/en/places/bbox",
      params: {
        apikey: "5ae2e3f221c38a28845f05b650bf172d8f27ae520fc0a943b5645af6",
        lang: "en",
        lon_min: Math.min(...countryCoordsArray[0]), lon_max: Math.max(...countryCoordsArray[0]),
        lat_min: Math.min(...countryCoordsArray[1]), lat_max: Math.max(...countryCoordsArray[1]),
        rate: 3, limit: 500,
        kinds: "foods,apartments,guest_houses,resorts,villas_and_chalet,amusement_parks,saunas,thermal_baths,water_parks,historic_architecture,skyscrapers,observation_towers,aquariums,history_museums,national_museums,planetariums,zoos,aviation_museums,maritime_museums,circuses,music_venues,cinemas,urban_environment,megaliths,castles,monuments,dams,beaches,geological_formations,natural_springs,nature_reserves,rivers,salt_lakes,waterfalls,historic_object,cathedrals,egyptian_temples,monasteries,mosques,synagogues,sport,banks,supermarkets,outdoor,marketplaces,malls,transport"
      }
    }).then(response => {
      landmarks = response.data.features.filter(landmark => {
        const landmarkCoords = landmark.geometry.coordinates;
        return d3.geoContains(countryObject, landmarkCoords);
      });

      updateLandmarks(countryObject.properties.name);
    });
  }
  
  const countrySearch = (e) => {
    e.preventDefault();
  
    const country = world.features.find((country) => country.properties.name.toLowerCase().includes(countrySearchField.toLowerCase()))
    setSelectedCountry(country.properties.name);
    document.querySelector(`[name="${country.properties.name}"]`).setAttribute("class", "active");
    
    params.set("country", country.properties.name); params.delete("landmark");
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    
    masterCentroid = d3.geoCentroid(country);
    rotationAnimation(-masterCentroid[0], -masterCentroid[1], country.properties.name);
    
    updateAirports(country.properties.name); updateLandmarks(country.properties.name);
    setActiveLandmark(""); fetchLandmarks(country); 
    setCountrySearchField("");
  }

  useEffect(() => {
    const mapContainer = mapRef.current;
    const width = mapContainer.getBoundingClientRect().width;
    const height = 1073;
    const sensitivity = 75;

    document.getElementById("box").style.width = "46%";
    document.getElementById("box").style.height = "90%";
    document.getElementById("box").style.bottom = "25px";

    const projection = d3.geoOrthographic()
      .scale(450).rotate([0, -30])
      .center([0, 0]).translate([width / 2, height / 2]);      

    projectionRef.current = projection;

    const initialScale = projection.scale();
    const path = d3.geoPath().projection(projection);
    pathRef.current = path;

    const svg = d3.select(mapContainer).append("svg").attr("width", "100%").attr("height", "100%");
    svgRef.current = svg;

    const globe = svg.append("circle")
      .attr("fill", "#334685").attr("stroke", "#000").attr("stroke-width", "0.2")
      .attr("cx", width / 2).attr("cy", height / 2).attr("r", initialScale);
      
    svg.call(d3.drag().on("drag", (event) => {
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
      svg.selectAll("path").attr("d", path);
      globe.style("cursor", "grab");
      updateAirports(params.get("country") || ""); updateLandmarks(params.get("country"));
    }))
      .call(d3.zoom().on("zoom", (event) => {
        if (event.transform.k > 0.5) {
          projection.scale(initialScale * event.transform.k);
          zoomRef.current = event.transform;
          svg.selectAll("path").attr("d", path);
          globe.attr("r", projection.scale());

          document.getElementById("box").style.width =
            document.querySelector("circle").getBoundingClientRect().width + "px";
          document.getElementById("box").style.height =
            document.querySelector("circle").getBoundingClientRect().width + "px";

          if (event.transform.k <= 0.89)
            document.getElementById("box").style.top = (0.57 / event.transform.k) * 28 + "vh";
          else 
            document.getElementById("box").style.top = (0.57 / event.transform.k) * 5.5 + "vh";
        } else event.transform.k = 0.5;

        updateAirports(params.get("country") || ""); updateLandmarks(params.get("country"));
      }));

    const map = svg.append("g");

    map.append("g")
      .attr("class", "countries")
      .attr("box-shadow", "rgb(38, 57, 77) 0px 20px 30px -10px")
      .selectAll("path").data(world.features).enter().append("path")
      .attr("id", "country").attr("name", d => d.properties.name)
      .attr("d", path).attr("fill", "#181816")
      .style("stroke", "#FFF7Eb").style("stroke-width", .15)
      .on("click", function (event, d) {
        params.set("country", d.properties.name);
        window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        document.querySelector(".active") && document.querySelector(".active").setAttribute("class", "");
        setSelectedCountry(d.properties.name);
        d3.select(this).attr("class", "active");

        const centroid = d3.geoCentroid(d);
        masterCentroid = centroid;
        rotationAnimation(-centroid[0], -centroid[1], d.properties.name);
        
        fetchLandmarks(d);    
        updateAirports(selectedCountry);    
      })
  }, []);

  return (
    <div id="app">
      <video src={StarsVideo} autoPlay muted loop></video>

      <form id="search" onSubmit={countrySearch}>
        <input type="text" value={countrySearchField} onChange={(e) => setCountrySearchField(e.target.value)}
          placeholder="Search for a country..." id="searchBox"/>
        <img src={magnifyingGlass} type="img/png" alt="" />
      </form>
      
      <div id="coordinates">
        <h1>Lng: {Math.floor(masterCentroid[0])}°, {Math.abs(masterCentroid[0]%1).toFixed(2).replace(/^0\./, "")%60}"</h1>
        <h1>Lat: {Math.floor(masterCentroid[1])}°, {Math.abs(masterCentroid[1]%1).toFixed(2).replace(/^0\./, "")%60}"</h1>
      </div>

      <div id="map" ref={mapRef} style={{ width: "100%", height: "105.65vh" }}>
        <div id="box"></div>
      </div>

      {selectedCountry ? <CountryData countryName={selectedCountry} /> : null}
      {activeAirport ? <AirportData name={activeAirport}/> : null}
      {activeLandmark ? <LandmarkData xid={activeLandmark}/> : null}

      <div id="buttons">
        <button onClick={resetZoom}><h2 id="resetZoom">Reset zoom</h2></button>
        <button onClick={resetRotation}><h2 id="resetRotation">Reset rotation</h2></button>
      </div>
    </div>
  );
}
