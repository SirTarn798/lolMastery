import axios from "axios";
import express from "express";
import bodyParser from "body-parser";

const port = 3000;
const app = express();

const getID_URL = "https://th2.api.riotgames.com/lol/summoner/v4/summoners/by-name/"
const getTopChamps_URL = "https://th2.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/"

const API_KEY = "RGAPI-c5fb03a8-7e79-4fff-aed8-d6e8fa3c9f8b";
const apiAdd = "?api_key=" + API_KEY;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

async function getID(summoner) {
    const response = await axios.get(getID_URL + summoner + "/" + apiAdd);
    const result = response.data;
    const id = result.puuid;
    return id;

}

async function getTopChamps(id) {
    let topChamps = [];
    const response = await axios.get(getTopChamps_URL + id + "/top/" + apiAdd);
    const result = response.data;
    for (let item of result) {
        const champ = {
            champId: item.championId,
            champLv: item.championLevel,
        };
        topChamps.push(champ);
    }

    return topChamps;
    
}

async function getLatestDDragon() {
    const response = await axios.get("http://ddragon.leagueoflegends.com/cdn/13.19.1/data/en_US/champion.json");
    const result = response.data;
    return result.data;
 }

 async function getChampionByKey(key) {

    const champions = await getLatestDDragon();
    for(let champ in champions) {
        if(champions[champ].key === key) {
            return champions[champ].name.replace(/\s+/g, '');
        }
    }
 
    return false;
 
 }


app.listen(port, () => {
    console.log("Server is running on port 3000");
});

app.get("/", (req,res) => {
    res.render("index.ejs");
});

app.post("/", async (req,res) => {
    let summoner = req.body.summoner;
    const id = await getID(summoner);
    const topChamps = await getTopChamps(id);
    for(let champ of topChamps) {
        let id = await getChampionByKey(champ.champId.toString());
        champ['champName'] = id;
    }
    res.render("index.ejs", {data:topChamps});
});