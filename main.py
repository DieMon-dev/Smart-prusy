import time
import network
import ubinascii
from time import sleep
from GetConfig import *

#Wi-Fi connection
f = open('Wi-Fi_config.txt', 'r')
config_text = f.read()

ssid = getSSID(config_text)
password = getWiFiPWD(config_text)
f.close()

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)
mac = ubinascii.hexlify(network.WLAN().config('mac'),':').decode()
print(mac)

# Wait for connect or fail
max_wait = 10 
while max_wait > 0:
    if wlan.status() < 0 or wlan.status() >= 3:
        break
    max_wait -= 1
    print('waiting for connection...')
    sleep(10)
# Handle connection error
if wlan.status() != 3:
    raise RuntimeError('network connection failed')
else:
    print('connected')
    status = wlan.ifconfig()
    print( 'ip = ' + status[0] )
## End Wi-Fi Connecting


#read data module
from machine import Pin, I2C
led = machine.Pin("LED", machine.Pin.OUT)
def blink(delay, n):
    for i in range(n):
        led.on()
        sleep(delay/2)
        led.off()
        sleep(delay/2)
        i+=1
import bme280       #importing BME280 library
i2c = I2C(0, sda=Pin(20), scl=Pin(21), freq=400000)    #initializing the I2C method 
i = 1
while True:
    bme = bme280.BME280(i2c=i2c) #BME280 object created
    temperature, pressure, humidity = bme.read_compensated_data()
    
    
    print(f"Pomiar {i} ----------------------------------------")
    print("Temperature: {:.2f} C".format(temperature / 100))
    print("Pressure: {:.2f} hPa".format(pressure / 256 / 100))
    print("Humidity: {:.2f} %".format(humidity / 1024))                      #printing the sensor values
    i+=1
    blink(1, 5)                    #delay of 5s
    



