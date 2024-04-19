from machine import Pin, I2C
from time import sleep

import bme280       #importing BME280 library
i2c = I2C(0, sda=Pin(20), scl=Pin(21), freq=400000)    #initializing the I2C method 
i = 1
while True:
    bme = bme280.BME280(i2c=i2c) #BME280 object created
    temperature, pressure, humidity = bme.read_compensated_data()
    
    print("Pomiar", i, "----------------------------------------")
    print("Temperature: {:.2f} C".format(temperature / 100))
    print("Pressure: {:.2f} hPa".format(pressure / 256 / 100))
    print("Humidity: {:.2f} %".format(humidity / 1024))                      #printing the sensor values
    i+=1
    sleep(10)                                #delay of 2s
    
