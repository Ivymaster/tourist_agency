/* eslint-disable */

const mapBoxPodatci = $("#mapBoxPodatci").data("value");
 
mapboxgl.accessToken = 'pk.eyJ1IjoiaXZ5bWFzdGVyIiwiYSI6ImNrZ21tbXVwMTBta2oyeW8xM25xaXh5ZHkifQ.tbzwFjrRq9ligzXVdP-lOg';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/ivymaster/ckgmn0vnz0s7k19pk5xvuy4h0',
scrollZoom: true,
zoom: 3
  });

 const bounds = new mapboxgl.LngLatBounds();

 mapBoxPodatci.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat([loc.coordinates[1], loc.coordinates[0]])
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat([loc.coordinates[1], loc.coordinates[0]])
      .setHTML(`<p>${loc.redniBroj}#: Dan ${loc.dan}-${loc.adresa}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend([loc.coordinates[1], loc.coordinates[0]]);
  });

  map.fitBounds(bounds, {padding: {
    top: 22,
    bottom: 22,
    left: 22,
    right: 22
  }});