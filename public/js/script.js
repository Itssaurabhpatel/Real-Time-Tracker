const socket = io();
let map;
const markers = {};

// Function to initialize the map
function initializeMap(latitude, longitude) {
    map = L.map("map").setView([latitude, longitude], 15);

    // Add OpenStreetMap tiles to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "OpenStreetMap"
    }).addTo(map);
}

// Define the custom icon
const customIcon = L.icon({
    iconUrl: '/image.png', // Update this path to your custom marker image
    iconSize: [38, 38], // Adjust the size as needed
    iconAnchor: [19, 38], // The anchor will be in the middle bottom
    popupAnchor: [0, -38] // Position of the popup relative to the icon
});

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            initializeMap(latitude, longitude);

            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    socket.emit('send-location', { latitude, longitude });
                },
                (error) => {
                    console.log(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        },
        (error) => {
            console.log(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
