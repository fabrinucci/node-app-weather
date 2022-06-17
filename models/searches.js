const fs = require('fs');
const axios = require('axios');

class Searches {

  history = [];
  dbPath = './db/database.json'

  constructor() {

    this.readDB();
  }

  get historyCapitalize() {
    return this.history.map( place => {

      let words = place.split(' ');
      words = words.map( w => w[0].toUpperCase() + w.substring(1));

      return words.join(' ');

    })
  }

  get paramsMapbox() {
    return {
      'access_token': process.env.MAPBOX_KEY,
      'language': 'en',
      'limit': 5
    }
  }

  get paramsWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric'
    }
  }

  async city ( city = '' ) {

    const instance = axios.create({
      baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ city }.json?`,
      params: this.paramsMapbox
    })

    const res = await instance.get();
    return res.data.features.map( info => ({
      id: info.id,
      name: info.place_name,
      lng: info.center[0],
      lat: info.center[1]
    }))
  }

  async placeWeather( lat, lon ) {

    const instance = axios.create({
      baseURL: 'https://api.openweathermap.org/data/2.5/weather?',
      params: { ...this.paramsWeather, lat, lon }
    }) 

    try {

      const res = await instance.get();
      const { weather, main } = res.data

      return {
        desc: weather[0].description,
        temp: main.temp,
        min: main.temp_min,
        max: main.temp_max,
      }

    } catch (err) {
      console.log(err);
    }
  }

  addHistory( place = '' ) {

    if( this.history.includes(place.toLocaleLowerCase()) ) return;

    this.history = this.history.splice(0, 4);

    this.history.unshift( place.toLocaleLowerCase() );

    this.saveDB();
  }

  saveDB() {

    const payload = {
      history: this.history
    }

    fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );
    
  }

  readDB() {

    if( !fs.existsSync( this.dbPath ) ) return;
    
    const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } )
    const data = JSON.parse( info );
    this.history = data.history
  }
}

module.exports = Searches;