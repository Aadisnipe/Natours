/* eslint-disable */

let mapElement;
let locationsData;

// 👉 Called from your app (after DOM loads)
export const displayMap = (mapEl) => {
  if (!mapEl) return;

  mapElement = mapEl;
  locationsData = JSON.parse(mapEl.dataset.locations);
};

// 👉 MUST be global for Google Maps
window.initMap = function () {
  if (!mapElement || !locationsData) return;

  const map = new google.maps.Map(mapElement, {
    zoom: 10,
    center: {
      lat: locationsData[0].coordinates[1],
      lng: locationsData[0].coordinates[0],
    },
    disableDefaultUI: true,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
      { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
      {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#f5f5f5' }],
      },
    ],
  });

  const bounds = new google.maps.LatLngBounds();

  const sortedLocations = [...locationsData].sort((a, b) => a.day - b.day);

  sortedLocations.forEach((loc) => {
    const lat = loc.coordinates[1];
    const lng = loc.coordinates[0];

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="font-size:14px;font-weight:bold;color:#1e3708;">
        Day ${loc.day}: ${loc.description}
      </div>`,
      maxWidth: 170,
    });

    marker.addListener('mouseover', () => {
      infoWindow.open(map, marker);
    });

    marker.addListener('mouseout', () => {
      infoWindow.close();
    });

    bounds.extend({ lat, lng });
  });

  if (sortedLocations.length > 1) {
    map.fitBounds(bounds, 100);
  } else {
    map.setCenter(bounds.getCenter());
    map.setZoom(12);
  }
};
