//Generated with ChatGPT
// Initialize map (centered on Oregon)
const map = L.map('map', {
    zoomControl: true
}).setView([44.0, -120.5], 7);

// Basemap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Scale bar
L.control.scale().addTo(map);

// Layer groups (order matters)
const citiesLayer = L.layerGroup().addTo(map);
const busPedLayer = L.layerGroup().addTo(map);
const transportStopsLayer = L.layerGroup().addTo(map);

// ----------------------
// STYLES
// ----------------------

// Administrative areas (blue outline, no fill)
function citiesStyle(feature) {
    return {
        color: '#007bff',   // bright blue
        weight: 2,
        fillOpacity: 0      // no fill
    };
}

// Busways (thicker orange line)
function lineStyle(feature) {
    return {
        color: '#bb27f5',   // fuscia
        weight: 5,
        fillOpacity: .5
    };
}

// Transport stops (red points)
function stopStyle(feature) {
    return {
        radius: 5,
        fillColor: '#de2d26',
        color: '#fff',
        weight: 1,
        fillOpacity: 0.9
    };
}

// ----------------------
// LOAD ADMIN AREAS (BOTTOM LAYER)
// ----------------------
fetch('data/administrative_areas.geojson')
    .then(res => res.json())
    .then(data => {
        const cities = L.geoJSON(data, {
            style: citiesStyle,
            onEachFeature: function (feature, layer) {
                layer.bindPopup(
                    `<strong>${feature.properties.name || 'Region'}</strong>`
                );
            }
        });
        citiesLayer.addLayer(cities);
    });

// ----------------------
// TRANSPORT STOPS (MIDDLE LAYER)
// ----------------------
fetch('data/transport_stops.geojson')
    .then(res => res.json())
    .then(data => {
        const stops = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, stopStyle(feature));
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(
                    `<strong>${feature.properties.name || 'Stop'}</strong><br>
                     ${feature.properties.fclass || ''}`
                );
            }
        });
        transportStopsLayer.addLayer(stops);
    });
// ----------------------
// BUSWAYS (TOP LAYER)
// ----------------------
fetch('data/busway_and_pedestrian.geojson')
    .then(res => res.json())
    .then(data => {
        const lines = L.geoJSON(data, {
            style: lineStyle,
            onEachFeature: function (feature, layer) {
                layer.bindPopup(
                    `<strong>Type:</strong> ${feature.properties.fclass || 'Path'}`
                );
            }
        });
        busPedLayer.addLayer(lines);
    });



// ----------------------
// ADD LAYERS IN CORRECT Z ORDER
// ----------------------

// bottom → top rendering order
citiesLayer.addTo(map);
transportStopsLayer.addTo(map);
busPedLayer.addTo(map);

// Layer control
const overlayMaps = {
    "Cities": citiesLayer,
    "Busways and Pedestrian Paths": busPedLayer,
    "Transport Stops": transportStopsLayer
};

L.control.layers(null, overlayMaps).addTo(map);