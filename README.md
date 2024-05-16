# Smart-prusy

Pin connections for only usb mode (Rasberry Pico - WH611):
GND (pin 38) - GND\
VCC (pin 36) - VCC\
I2C0 SCL (pin27) - SCL\
I2C0 SDA (pin26) - SDA

CSB (Chip select) or SD0 (MISO in SPI mode) are unnecessary for I2C protocol

Pin connections for only baterry mode (Rasberry Pico - WH611):

## Smart Prusy Web UI

Welcome to the Smart Prusy Web User Interface (UI)! This interface is designed to enhance your interaction with the data collected from our environmental sensors. The beta version of the UI introduces essential features aimed at improving accessibility and facilitating the analysis of both real-time and historical data.

### Key Features

#### Real-Time Data Accessibility
The dashboard is optimized for quick access to current conditions. It features real-time updates on key metrics such as temperature, humidity, and pressure, allowing for immediate monitoring.

#### Historical Data Comparison
A dedicated section for historical data analysis helps users compare current readings with past data. Presented in a table format, this feature makes it easier to identify trends and anomalies over time.

## Interface Preview

Here's a preview of what our beta version looks like:

![Smart Prusy Web UI](https://github.com/DieMon-dev/Smart-prusy/blob/main/ReadmeImages/UIscreen1.png)
![Smart Prusy Web UI](https://github.com/DieMon-dev/Smart-prusy/blob/main/ReadmeImages/UIscreen2.png)


## The algorythm
### General algorythm script:
- On start up the program tries to read the WiFi configuration file. Collecting the SSID and connection password;
- Connection attempt;
- Program starts to collect data from the BME280 sensor (internet connection status isn't nessecary);
- If controller is connected to the network, it will send the collected data to the Firebase. In case of connection failure, program will record the data to the file named "localData.txt";
- Collecting next data group...

### Some tips:
- The information LED on controller turns on for about 2 seconds while data from sensor is collecting.
- If the network connection is not stable, controller doesn't stop its work.  It records data locally to send it to the Firebase as soon as connection established. 


