# Smart-prusy

Pin connections for only usb mode (Rasberry Pico - WH611):
GND (pin 38) - GND\
VCC (pin 36) - VCC\
I2C0 SCL (pin27) - SCL\
I2C0 SDA (pin26) - SDA

CSB (Chip select) or SD0 (MISO in SPI mode) are unnecessary for I2C protocol

Pin connections for only baterry mode (Rasberry Pico - WH611):


## The algorythm
General algorythm script:
- On start up the program tries to read the WiFi configuration file. Collecting the SSID and connection password;
- Connection attempt;
- Program starts to collect data from the BME280 sensor (internet connection status isn't nessecary);
- If controller is connected to the network, it will send the collected data to the Firebase. In case of connection failure, program will record the data to the file named "localData.txt";
- Collecting next data group...

Some tips:
- The information LED on controller turns on for about 2 seconds while data from sensor is collecting.
- If the network connection is not stable, controller doesn't stop its work.  It records data locally to send it to the Firebase as soon as connection established. 
