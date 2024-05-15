from machine import Pin, I2C
import bme280
import time
from WiFiHandler import tryToConnect, checkConnection
from firebaseHandler import update_firebase

# Wi-Fi connection
result = tryToConnect()

# Firebase URL
firebase_url = 'https://smart-prusy-default-rtdb.europe-west1.firebasedatabase.app/'

# Setup LED and I2C for BME280 sensor
led = Pin("LED", Pin.OUT)
i2c = I2C(0, sda=Pin(20), scl=Pin(21), freq=400000)
bme = bme280.BME280(i2c=i2c)  # Create BME280 object once to avoid re-initialization

measurement_count = 1  # To track the number of measurements

while True:
    led.on()
    sleep(1)
    bme = bme280.BME280(i2c=i2c) #BME280 object created
    sleep(1)
    led.off()

    temperature, pressure, humidity = bme.read_compensated_data()
    print(f"\nPomiar {measurement_count} ----------------------------------------")
    print(f"Temperature: {temperature / 100:.2f} C")
    print(f"Pressure: {pressure / 25600.0:.2f} hPa")
    print(f"Humidity: {humidity / 1024:.2f} %")
    print("--------------------------------------------------\n")
 
    data = {
        'temperature': temperature / 100,
        'pressure': pressure / 25600.0,
        'humidity': humidity / 1024,
        'timestamp': {".sv": "timestamp"}  # Firebase server value for timestamp
    }

    if checkConnection():
        update_firebase(firebase_url, 'sensor_data', data)
        print('Data written to remote database\n\n')
    else:
        with open('localData.txt', 'a') as file:
            file.write(f"{temperature / 100:.2f}C / {pressure / 25600.0:.2f}hPa / {humidity / 1024:.2f}%\n")
        with open('localData.txt', 'r') as file:
            print(file.read())
        print('Data written locally\n\n')

    measurement_count += 1
    time.sleep(30)  # delay of 25 seconds

