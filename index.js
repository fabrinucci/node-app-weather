require('dotenv').config();

const { inquirerMenu, pause, readInput, listPlaces } = require('./helpers/inquirer');
const Searches = require('./models/searches');

const main = async () => {

  const searches = new Searches();
  
  let option = '';

  do {
    option = await inquirerMenu();

    switch ( option ) {
      case 1:
        // Show Message
        const term = await readInput('City: '.brightCyan);

        // Search Place
        const places = await searches.city(term);
        
        // Show Place
        const id = await listPlaces(places);
        if( id === '0' ) continue;

        const placeSel = places.find( place => place.id === id )

        // Save DB
        searches.addHistory( placeSel.name );

        // Weather
        const weather = await searches.placeWeather( placeSel.lat, placeSel.lng );

        // Show Results
        console.clear();
        console.log('\nCity Info\n'.brightCyan);
        console.log('City:'.brightYellow, placeSel.name.brightGreen );
        console.log('Lat:'.brightYellow, `${placeSel.lat}`.brightGreen );
        console.log('Long:'.brightYellow, `${placeSel.lng}`.brightGreen );
        console.log('Temp:'.brightYellow, `${weather.temp}°C`.brightGreen );
        console.log('Min:'.brightYellow, `${weather.min}°C`.brightGreen );
        console.log('Max:'.brightYellow, `${weather.max}°C`.brightGreen );
        console.log('Description:'.brightYellow, weather.desc.brightGreen );

      break;

      case 2: 
        searches.historyCapitalize.forEach(( place, i ) => {
          const idx = `${ i + 1 }.`.brightGreen;
          console.log(`${ idx } ${ place }`);
        })
      break
    
      default:
        break;
    }

    if( option !== 0 ) await pause();
  } while ( option !== 0 );
  
}

main()