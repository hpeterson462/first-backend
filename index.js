require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const weatherData = require('./data/weather.js');
const request = require('superagent');

app.use(cors());

const { GEOCODE_API_KEY,
    WEATHER_API_KEY,
    HIKING_API_KEY } = process.env;

//location api
async function getLatLong(cityName) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}& format=json`);

    const city = response.body[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon
    };
}

app.get('/location', async (req, res) => {
    try {
        const userInput = req.query.search;

        const mungedData = await getLatLong(userInput);

        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//weather api
async function getWeather(lat, lon) {
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=38.123&lon=-78.543&key=${WEATHER_API_KEY}`)

    const weatherItem = response.body[0];
    return {
        forecast: weatherItem.weather.description,
        time: new Date(weatherItem.ts * 1000)
    };
}

app.get('/weather', async (req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude;

        const mungedData = await getWeather(userLat, userLong);

        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//hiking api
async function getHiking(lat, lng) {
    const response = await request.get(`https://www.hikingproject.com/data/get-trails?lat={lat}&lon={lng}&maxDistance=200&key=${HIKING_API_KEY}`);

    const trails = response.body[0];

    return {
        trail: trails.name,
        summary: trails.summary,
        length: trails.length
    };
}

app.get('/hiking', async (req, res) => {
    try {
        const userTrail = req.query.search;

        const mungedData = await getHiking(userTrail);

        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})