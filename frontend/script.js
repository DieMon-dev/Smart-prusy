document.addEventListener('DOMContentLoaded', function() {
    fetchRealTimeData();
    fetchData();
});

function fetchData() {
    const dbRefInside = firebase.database().ref('inside_sensor_data');
    const dbRefOutside = firebase.database().ref('outside_sensor_data');
    // Order by 'timestamp' child, limit to the last 50 entries
    dbRefInside.orderByChild('timestamp').limitToLast(50).on('value', snapshot => {
        const data = [];
        snapshot.forEach(childSnapshot => {
            data.unshift(childSnapshot.val()); // Prepends data to keep newest at the top
        });
        updateTable(data);
    });
}

function updateTable(data) {
    const table = document.getElementById('history').getElementsByTagName('tbody')[0];
    table.innerHTML = '';  // Clear existing table rows

    data.forEach(sensor => {
        const row = table.insertRow(-1);  // Insert a new row at the end of the table
        const dateCell = row.insertCell(0);
        const timeCell = row.insertCell(1);
        const tempCell = row.insertCell(2);
        const humCell = row.insertCell(3);
        const pressCell = row.insertCell(4);

        // Convert timestamp to human-readable date and time
        const date = new Date(sensor.timestamp);
        dateCell.innerHTML = date.toLocaleDateString(); // Displays date
        timeCell.innerHTML = date.toLocaleTimeString(); // Displays time

        tempCell.innerHTML = sensor.temperature.toFixed(2) + " °C";
        humCell.innerHTML = sensor.humidity.toFixed(2) + " %";
        pressCell.innerHTML = sensor.pressure.toFixed(2) + " hPa";
    });
}

function fetchRealTimeData() {
    const dbRefInside = firebase.database().ref('inside_sensor_data').limitToLast(1);  // Fetching the most recent record for inside campus
    const dbRefOutside = firebase.database().ref('outside_sensor_data').limitToLast(1); // Fetching the most recent record for outside campus

    dbRefInside.on('value', snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const latestKey = Object.keys(data)[0];  // Get the latest data entry
            const latestData = data[latestKey];
            
            // Update the webpage elements for inside campus
            document.getElementById('temperature-inside').textContent = `${latestData.temperature.toFixed(2)}`;
            document.getElementById('humidity-inside').textContent = `${latestData.humidity.toFixed(2)}`;
            document.getElementById('pressure-inside').textContent = `${latestData.pressure.toFixed(2)}`;

            // Update the current time based on the latest data timestamp
            const date = new Date(latestData.timestamp);
            document.getElementById('now-time-inside').textContent = date.toLocaleString();
        }
    });

    dbRefOutside.on('value', snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const latestKey = Object.keys(data)[0];  // Get the latest data entry
            const latestData = data[latestKey];
            
            // Update the webpage elements for outside campus
            document.getElementById('temperature-outside').textContent = `${latestData.temperature.toFixed(2)}`;
            document.getElementById('humidity-outside').textContent = `${latestData.humidity.toFixed(2)}`;
            document.getElementById('pressure-outside').textContent = `${latestData.pressure.toFixed(2)}`;

            // Update the current time based on the latest data timestamp
            const date = new Date(latestData.timestamp);
            document.getElementById('now-time-outside').textContent = date.toLocaleString();
        }
    });
}
