/*eslint-disable */

export const displayMap = (locations) => {
var map = L.map('map', {
  zoomControl: false, //+ - disable
  scrollWheelZoom: false, //mouse wheel disable
  doubleClickZoom: false, // double click disable
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  crossOrigin: ''
}).addTo(map);

const points = [];
locations.forEach(loc => {
  points.push([loc.coordinates[1], loc.coordinates[0]]);
  L.marker([loc.coordinates[1], loc.coordinates[0]])
    .addTo(map)
    .bindPopup(
      `<p style="font-size: 1.2rem;">Day ${loc.day}: ${loc.description}</p>`,
      {
        autoClose: false
      }
    )
    .openPopup();
});

const bounds = L.latLngBounds(points).pad(0.7);
map.fitBounds(bounds);
}
