// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {

  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);

  console.log(data);
});


function createFeatures(earthquakeData) {


    // Define a markerSize function that will give each city a different radius based on its population
    function markerSize(magnitude) {
    return magnitude;
    }

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><h3> Magnitude: <strong>" + 
        feature.properties.mag + "</strong></h3><hr><p>" + 
        new Date(feature.properties.time) + "</p>");
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array

    function styleMarker(feature) {
        return {
          opacity: 1,
          fillOpacity: 0.75,
          fillColor: chooseColor(feature.properties.mag),
          color: "#000000",
          radius: getRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
      }
    
      // This function determines the color of the marker based on the magnitude of the earthquake.
      function chooseColor(magnitude) {
        switch (true) {
        case magnitude > 5:
          return "#c80cd4";
        case magnitude > 4:
          return "#5a0cd4";
        case magnitude > 3:
          return "#0c2ed4";
        case magnitude > 2:
          return "#0ca7d4";
        case magnitude > 1:
          return "#0cd4cf";
        default:
          return "#98ee00";
        }
      }
    
      // This function determines the radius of the earthquake marker based on its magnitude.
      // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
      function getRadius(magnitude) {
        if (magnitude === 0) {
          return 1;
        }

        return magnitude * 5;
      }
    
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
          },

        style: styleMarker,

        onEachFeature: onEachFeature
    });

    console.log(earthquakes);
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);

}


function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });


    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Satellite Map": satellite
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
        37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

}