import flask
from flask import request, jsonify
from gpiozero import LED
from time import sleep
from threading import Timer
import requests
import config
import threading

led = {}


def gpio_pulse(gpio_number, time_between):
    gpio_on(gpio_number)
    s = Timer(time_between, gpio_off, [gpio_number])
    s.start()

def gpio_on(gpio_number):
    global led
    if gpio_number not in led:
        led[gpio_number] = LED(gpio_number)
    led[gpio_number].off()
    print("LED on : " + str(gpio_number))

def gpio_off(gpio_number):
    global led
    if gpio_number not in led:
        led[gpio_number] = LED(gpio_number)
    led[gpio_number].on()
    print("LED on : " + str(gpio_number))

app = flask.Flask(__name__)
app.config["DEBUG"] = True

@app.route('/api/gpio', methods=['POST'])
def compare():
    body = request.get_json()
    gpio_number = body["gpioNumber"]
    time_between = 1
    if "timeBetween" in body:
        time_between = body["timeBetween"]
    # pulse, on, off
    action = body["action"]

    print("gpioNumber : " + str(gpio_number))
    print("action : " + action)

    status = "OK"

    if action == "pulse":
        gpio_pulse(gpio_number, time_between)
    elif action == "on":
        gpio_on(gpio_number)
    elif action == "off":
        gpio_off(gpio_number)
    else:
        status = "INVALID_ACTION"

    return jsonify({ "status": status })

def on_load():
    url = config.serverApiUrl + "/pi/getLastActionId"
    myobj = {'controllerId': config.controllerId}
    # x = requests.post(url, data = myobj)
    x = requests.post(url, json = myobj)
    res = x.json()
    print(res)
    if res["doorOpen"] == True:
        gpio_on(res["piGpioNumber"])

timer = threading.Timer(config.networkWaitDelay, on_load)
timer.start()

app.run(host='0.0.0.0', port=5000)

