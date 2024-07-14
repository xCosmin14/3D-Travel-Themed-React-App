import accomodation from "./assets/Accomodation.png";
import amusement from "./assets/Amusement.png";
import sauna from "./assets/Sauna.png";
import water from "./assets/Water.png";
import waterPark from "./assets/Water park.png";
import tower from "./assets/Tower.png";
import urban from "./assets/Urban.png";
import aquarium from "./assets/Aquarium.png";
import archeology from "./assets/Archeology.png";
import planetarium from "./assets/Planetarium.png";
import zoo from "./assets/Zoo.png";
import airport from "./assets/AirportPinpoint.png";
import boat from "./assets/Boat.png";
import circus from "./assets/Circus.png";
import concert from "./assets/Concert.png";
import film from "./assets/Film.png";
import stone from "./assets/Stone.png";
import dam from "./assets/Dam.png";
import beach from "./assets/Beach.png";
import nature from "./assets/Nature.png";
import church from "./assets/Church.png";
import egypt from "./assets/Egypt.png";
import mosque from "./assets/Mosque.png";
import synagogue from "./assets/Synagogue.png";
import sport from "./assets/Sport.png";
import bank from "./assets/Bank.png";
import store from "./assets/Store.png";
import car from "./assets/Car.png";

const categoryImages = {
    "appartments": accomodation,
    "guest_houses": accomodation,
    "resorts": accomodation,
    "villas_and_chalet": accomodation,
    "amusement_parks": amusement,
    "saunas": sauna,
    "thermal_baths": water,
    "water_parks": waterPark,
    "historic_architecture": tower,
    "skyscrapers": urban,
    "observation_towers": tower,
    "aquariums": aquarium,
    "history_museums": archeology,
    "national_museums": archeology,
    "planetariums": planetarium,
    "zoos": zoo,
    "aviation_museums": airport,
    "maritime_museums": boat,
    "circuses": circus,
    "music_venues": concert,
    "cinemas": film,
    "urban_environment": nature,
    "megaliths": stone,
    "castles": tower,
    "monuments": tower,
    "dams": dam,
    "beaches": beach,
    "geological_formations": nature,
    "natural_springs": water,
    "nature_reserves": nature,
    "rivers": water,
    "salt_lakes": water,
    "waterfalls": water,
    "historic_object": tower,
    "cathedrals": church,
    "egyptian_temples": egypt,
    "monasteries": church,
    "mosques": mosque,
    "synagogues": synagogue,
    "sport": sport,
    "banks": bank,
    "supermarkets": store,
    "outdoor": nature,
    "marketplaces": store,
    "malls": urban,
    "transport": car,
};


export default function setCategory(kinds) {
    const categories = kinds.split(",");
    let category = "";
    if (categoryImages[categories[0]]) category = categoryImages[categories[0]];
    else if (categoryImages[categories[1]]) category = categoryImages[categories[1]];
    else if (categoryImages[categories[2]]) category = categoryImages[categories[2]];
    
    return category;
}
