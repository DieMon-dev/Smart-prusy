import time
import network
import ubinascii
import datetime
from WiFiHandler import *

#Wi-Fi connection
result = tryToConnect()
## End Wi-Fi Connecting


#read data module
from machine import Pin, I2C
led = machine.Pin("LED", machine.Pin.OUT)


import bme280       #importing BME280 library
i2c = I2C(0, sda=Pin(20), scl=Pin(21), freq=400000)    #initializing the I2C method 
i = 1

while True:
    led.on()
    bme = bme280.BME280(i2c=i2c) #BME280 object created
    sleep(2)
    led.off()
    
    temperature, pressure, humidity = bme.read_compensated_data()
    print(f"\nPomiar {i} ----------------------------------------")
    print("Temperature: {:.2f} C".format(temperature / 100))
    print("Pressure: {:.2f} hPa".format(pressure / 256 / 100))
    print("Humidity: {:.2f} %".format(humidity / 1024))            #printing the sensor values
    print("--------------------------------------------------\n")
    result = checkConnection()
    if result:
        print('remote written\n\n')
    else:
        f = open('localData.txt', 'a')
        f.write(f"{temperature / 100}C / {pressure / 256 / 100}hPa / {humidity / 1024}%\n")
        f.close()
        f = open('localData.txt', 'r')
        print(f.read())
        f.close()
        print('local written\n\n')
    
    i+=1
    
    sleep(25)                    #delay of 5s
    


