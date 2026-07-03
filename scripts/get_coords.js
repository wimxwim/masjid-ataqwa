const https = require('https');

function geocode(address) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: '/search?format=json&q=' + encodeURIComponent(address),
      headers: {
        'User-Agent': 'NodeJS/18.0'
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const addresses = [
    "Masjid Jami At Taqwa, Jl Swadarma Raya, Ulujami",
    "Jl Swadarma Raya, Ulujami",
    "Jl Haji Rohimin, Ulujami",
    "Jl Sukun, Ulujami",
    "Jl Swadaya I, Ulujami",
    "Gg H Saidi, Ulujami",
    "Jl Haji Ridi, Ulujami",
    "Jl H Syam, Ulujami",
    "Jl Ulujami Raya, Ulujami"
  ];

  for (let addr of addresses) {
    const res = await geocode(addr);
    if (res.length > 0) {
      console.log(`${addr} -> ${res[0].lat}, ${res[0].lon}`);
    } else {
      console.log(`${addr} -> NOT FOUND`);
    }
  }
}
run();
