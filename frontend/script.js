function fetchData() {
    const dbRef = firebase.database().ref('sensor_data');
    // Order by 'timestamp' child, limit to the last 50 entries
    dbRef.orderByChild('timestamp').limitToLast(50).on('value', snapshot => {
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

// Assuming Firebase is correctly initialized and configured
function fetchRealTimeData() {
    const dbRef = firebase.database().ref('sensor_data').limitToLast(1);  // Fetching the most recent record
    dbRef.on('value', snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const latestKey = Object.keys(data)[0];  // Get the latest data entry
            const latestData = data[latestKey];
            
            // Update the webpage elements
            document.getElementById('temperature').textContent = `${latestData.temperature.toFixed(2)}`;
            document.getElementById('humidity').textContent = `${latestData.humidity.toFixed(2)}`;
            document.getElementById('pressure').textContent = `${latestData.pressure.toFixed(2)}`;
        }
    });
}

// Call this function when the document is loaded
document.addEventListener('DOMContentLoaded', fetchRealTimeData);


document.addEventListener('DOMContentLoaded', function() {
    fetchData();
});
