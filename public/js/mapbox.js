/*eslint-disable*/
export const displayMap = (mapEl) => {
  const locations = JSON.parse(mapEl.dataset.locations);

  window.initMap = function () {
    const map = new google.maps.Map(mapEl, {
      zoom: 10,
      center: {
        lat: locations[0].coordinates[1],
        lng: locations[0].coordinates[0],
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
        {
          featureType: 'administrative.land_parcel',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#bdbdbd' }],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#eeeeee' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#757575' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#e5e5e5' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9e9e9e' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }],
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#757575' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#dadada' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#616161' }],
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9e9e9e' }],
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [{ color: '#e5e5e5' }],
        },
        {
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [{ color: '#eeeeee' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#c9c9c9' }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9e9e9e' }],
        },
      ],
    });

    const bounds = new google.maps.LatLngBounds();

    // 👉 1. Sort locations by day
    const sortedLocations = [...locations].sort((a, b) => a.day - b.day);

    // 👉 2. Create markers + extend bounds
    sortedLocations.forEach((loc) => {
      const lat = loc.coordinates[1];
      const lng = loc.coordinates[0];

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        // icon: '/img/green-pin.png',
      });

      // 👉 Create InfoWindow (tooltip)
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-size:14px;font-weight:bold;color:#1e3708;">
                Day ${loc.day}: ${loc.description}
              </div>`,
        maxWidth: 170,
      });

      // 👉 Show on hover
      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker);
      });

      // 👉 Hide when mouse leaves
      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      bounds.extend({ lat, lng });
    });

    // 👉 4. Fit bounds
    if (sortedLocations.length > 1) {
      map.fitBounds(bounds, 100);
    } else {
      map.setCenter(bounds.getCenter());
      map.setZoom(12);
    }
  };
};
