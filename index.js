// Wait for the device to be ready
document.addEventListener("deviceready", onDeviceReady, false);

let currentMarker = null; // Store the current marker
let lastLatLng = null; // Store the last known location
let map; // Declare the map variable

function onDeviceReady() {
    console.log("navigator.geolocation works well");
    
    // Initialize the map
    initMap();

    // Start watching the user's position
    const watchID = navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, {
        enableHighAccuracy: true,
        maximumAge: 30000, // Cache position for 30 seconds
        timeout: 60000 // Timeout after 60 seconds
    });

    console.log("Watching position with ID:", watchID);
}

// Initialize the map with Leaflet
function initMap() {
    map = L.map('map', {
        tap: false, // Disable tap delay for mobile
        zoomControl: true // Enable zoom control on mobile
    }).setView([51.505, -0.09], 13); // Starting coordinates (London)

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Add Locate Control
    L.control.locate({
        position: 'topright',
        strings: {
            title: "Show me where I am"
        },
        locateOptions: {
            enableHighAccuracy: true
        },
        flyTo: true,
        keepCurrentZoomLevel: true,
        markerClass: L.circleMarker,
        drawCircle: false,
    }).addTo(map);
}

// Success callback for getting the current position
function geolocationSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);

    // Update the map or UI with the current position
    updateMap(lat, lng);
}

// Error callback for geolocation
function geolocationError(error) {
    console.error(`Error occurred: ${error.code} - ${error.message}`);
    alert("Unable to retrieve your location. Please check your device's location settings.");
}

// Function to update the map with the current coordinates
function updateMap(lat, lng) {
    if (!currentMarker) {
        currentMarker = L.marker([lat, lng]).addTo(map)
            .bindPopup(`Your location:<br>Latitude: ${lat}<br>Longitude: ${lng}`).openPopup();
    } else {
        smoothMoveMarker(currentMarker, L.latLng(lat, lng));
        currentMarker.bindPopup(`Your location:<br>Latitude: ${lat}<br>Longitude: ${lng}`).openPopup();
    }
}

// Function to smoothly move the marker
function smoothMoveMarker(marker, latlng) {
    if (!lastLatLng) {
        marker.setLatLng(latlng);
    } else {
        // Create a smooth animation using a polyline
        var line = L.polyline([lastLatLng, latlng], { color: 'blue' }).addTo(map);
        marker.setLatLng(latlng);
        
        // Animate the marker movement
        L.DomUtil.addClass(marker._icon, 'moving');
        setTimeout(() => {
            L.DomUtil.removeClass(marker._icon, 'moving');
            map.removeLayer(line); // Remove the line after the animation
        }, 1000);
    }
    lastLatLng = latlng;
}

// Optional: Clear watch when no longer needed
function clearGeolocationWatch(watchID) {
    navigator.geolocation.clearWatch(watchID);
    console.log("Stopped watching position");
}

// Function to get the current position once (if needed)
function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 60000
    });
}
