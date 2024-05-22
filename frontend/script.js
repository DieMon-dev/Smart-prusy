let tempChart, humChart, pressChart;
let sortCriteria = 'date';
let sortOrder = {
    date: 'asc',
    temperature: 'asc',
    humidity: 'asc',
    pressure: 'asc'
};

document.addEventListener('DOMContentLoaded', function() {
    fetchRealTimeData(); // Fetch real-time data independently
    fetchData(); // Fetch historical data based on selected options
    document.getElementById('sortCriteria').value = sortCriteria;
    window.addEventListener('scroll', toggleScrollToTopButton);
});

function setSortCriteria(criteria) {
    if (sortCriteria === criteria) {
        sortOrder[criteria] = sortOrder[criteria] === 'asc' ? 'desc' : 'asc';
    } else {
        sortCriteria = criteria;
        sortOrder[criteria] = 'asc';
    }
    fetchData();
}

function fetchData() {
    const location = document.getElementById('location').value;
    const dbRef = firebase.database().ref(location === 'inside' ? 'inside_sensor_data' : 'outside_sensor_data');
    
    dbRef.orderByChild('timestamp').on('value', snapshot => {
        const data = [];
        snapshot.forEach(childSnapshot => {
            data.unshift(childSnapshot.val()); // Prepends data to keep newest at the top
        });
        const mode = document.getElementById('dataMode').value;
        let processedData;
        if (mode === 'real') {
            processedData = data;
        } else if (mode === 'hourly') {
            processedData = calculateAverages(data, 'hour');
        } else if (mode === 'daily') {
            processedData = calculateAverages(data, 'day');
        } else if (mode === 'monthly') {
            processedData = calculateAverages(data, 'month');
        }
        const sortedData = sortData(processedData, sortCriteria, sortOrder[sortCriteria]);
        updateTable(sortedData, mode);
        updateCharts(sortedData, mode);  // Always use sorted data for charts
        highlightSortedColumn(sortCriteria);
    });
}

function calculateAverages(data, period) {
    const periods = {};
    data.forEach(sensor => {
        let periodKey;
        const date = new Date(sensor.timestamp);
        if (period === 'hour') {
            periodKey = date.toISOString().slice(0, 13) + ':00:00.000Z'; // YYYY-MM-DDTHH:00:00.000Z
        } else if (period === 'day') {
            periodKey = date.toISOString().slice(0, 10) + 'T00:00:00.000Z'; // YYYY-MM-DDT00:00:00.000Z
        } else if (period === 'month') {
            periodKey = date.toISOString().slice(0, 7) + '-01T00:00:00.000Z'; // YYYY-MM-01T00:00:00.000Z
        }
        if (!periods[periodKey]) {
            periods[periodKey] = { temperature: [], humidity: [], pressure: [] };
        }
        periods[periodKey].temperature.push(sensor.temperature);
        periods[periodKey].humidity.push(sensor.humidity);
        periods[periodKey].pressure.push(sensor.pressure);
    });

    const averages = Object.keys(periods).map(periodKey => {
        const tempSum = periods[periodKey].temperature.reduce((a, b) => a + b, 0);
        const humSum = periods[periodKey].humidity.reduce((a, b) => a + b, 0);
        const pressSum = periods[periodKey].pressure.reduce((a, b) => a + b, 0);
        return {
            periodKey: periodKey,
            temperature: tempSum / periods[periodKey].temperature.length,
            humidity: humSum / periods[periodKey].humidity.length,
            pressure: pressSum / periods[periodKey].pressure.length
        };
    });

    return averages;
}

function formatPeriodKey(periodKey, mode) {
    const date = new Date(periodKey);
    if (mode === 'hourly') {
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:00`;
    } else if (mode === 'daily') {
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    } else if (mode === 'monthly') {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    }
    return periodKey;
}

function sortData(data, criteria, order) {
    return data.sort((a, b) => {
        let comparison = 0;
        if (criteria === 'date') {
            comparison = new Date(a.periodKey) - new Date(b.periodKey);
        } else {
            comparison = a[criteria] - b[criteria];
        }
        return order === 'asc' ? comparison : -comparison;
    });
}

function highlightSortedColumn(criteria) {
    const columns = ['date', 'temperature', 'humidity', 'pressure'];
    columns.forEach(column => {
        const th = document.getElementById(`${column}-header`);
        if (column === criteria) {
            th.classList.add('sorted');
        } else {
            th.classList.remove('sorted');
        }
    });
}

function updateTable(data, mode) {
    const table = document.getElementById('history').getElementsByTagName('tbody')[0];
    table.innerHTML = '';  // Clear existing table rows

    data.forEach(sensor => {
        const row = table.insertRow(-1);  // Insert a new row at the end of the table
        const dateCell = row.insertCell(0);
        const tempCell = row.insertCell(1);
        const humCell = row.insertCell(2);
        const pressCell = row.insertCell(3);

        let date;
        if (mode === 'real') {
            date = new Date(sensor.timestamp).toLocaleString();
        } else {
            date = formatPeriodKey(sensor.periodKey, mode);
        }

        dateCell.innerHTML = date; // Displays date and time or period key
        tempCell.innerHTML = sensor.temperature.toFixed(2) + " °C";
        humCell.innerHTML = sensor.humidity.toFixed(2) + " %";
        pressCell.innerHTML = sensor.pressure.toFixed(2) + " hPa";

        // Highlight the sorted column
        const columns = ['date', 'temperature', 'humidity', 'pressure'];
        columns.forEach((column, index) => {
            const cell = row.cells[index];
            if (column === sortCriteria) {
                cell.classList.add('sorted');
            } else {
                cell.classList.remove('sorted');
            }
        });
    });
}

function updateCharts(data, mode) {
    // Sort data by date in ascending order for the charts
    const sortedData = data.slice().sort((a, b) => new Date(a.periodKey) - new Date(b.periodKey));
    const labels = sortedData.map(sensor => mode === 'real' ? new Date(sensor.timestamp).toLocaleString() : formatPeriodKey(sensor.periodKey, mode));
    const temperatures = sortedData.map(sensor => sensor.temperature);
    const humidities = sortedData.map(sensor => sensor.humidity);
    const pressures = sortedData.map(sensor => sensor.pressure);

    if (tempChart) tempChart.destroy();
    if (humChart) humChart.destroy();
    if (pressChart) pressChart.destroy();

    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    const humCtx = document.getElementById('humidityChart').getContext('2d');
    const pressCtx = document.getElementById('pressureChart').getContext('2d');

    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'red',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date and Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });

    humChart = new Chart(humCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity (%)',
                data: humidities,
                borderColor: 'blue',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date and Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    }
                }
            }
        }
    });

    pressChart = new Chart(pressCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pressure (hPa)',
                data: pressures,
                borderColor: 'orange',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date and Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Pressure (hPa)'
                    }
                }
            }
        }
    });
}

function scrollToEndOfTable() {
    const tableContainer = document.getElementById('endTable').parentElement;
    const table = document.getElementById('endTable');
    tableContainer.scrollTo({
        top: tableContainer.scrollHeight,
        behavior: 'smooth'
    });
    table.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
}

function toggleScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (window.scrollY > 200) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
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
