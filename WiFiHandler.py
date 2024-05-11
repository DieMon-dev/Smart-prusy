import time
import network
from time import sleep
from GetConfig import *
import ubinascii


def tryToConnect():
    f = open('Wi-Fi_config.txt', 'r')
    config_text = f.read()

    ssid = getSSID(config_text)
    password = getWiFiPWD(config_text)
    f.close()
    global wlan
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    mac = ubinascii.hexlify(network.WLAN().config('mac'),':').decode()
    print(mac)

    # Wait for connect or fail
    max_wait = 5 
    while max_wait > 0:
        if wlan.status() < 0 or wlan.status() >= 3:
            break
        max_wait -= 1
        print('waiting for connection...')
        sleep(10)
    # Handle connection error
    if wlan.status() != 3:
        print('RuntimeError: network connection failed. The data will be written down locally')
        return False
    else:
        print('connected')
        status = wlan.ifconfig()
        print( 'ip = ' + status[0] )
        return True

def checkConnection():
    if wlan.status() != 3:
        tryToConnect()
        return False
    else:
        return True