import flask

from flask import request, jsonify

from gpiozero import LED
from time import sleep
  
# led = LED(18)
# led.on()
  
def gpio_pulse(gpio_number):
    led = LED(gpio_number)
    led.on()
    print("LED on : " + str(gpio_number))
    sleep(1)
    led.off()
    sleep(1)
    led.on()
    print("LED off : " + str(gpio_number))

def gpio_on(gpio_number):
    led = LED(gpio_number)
    led.off()
    print("LED on : " + str(gpio_number))

def gpio_off(gpio_number):
    led = LED(gpio_number)
    led.on()
    print("LED on : " + str(gpio_number))

app = flask.Flask(__name__)
app.config["DEBUG"] = True

# @app.route('/api/gpio', methods=['POST'])
# def compare():
#     body = request.get_json()
#     gpio_number = body["gpioNumber"]
#     # pulse, on, off
#     action = body["action"]

#     print("gpioNumber : " + str(gpio_number))
#     print("action : " + action)

# main.py                                                  
@app.route('/api/gpio', methods=['POST'])
def compare():
    body = request.get_json()
    gpio_number = body["gpioNumber"]
    # pulse, on, off
    action = body["action"]

    print("gpioNumber : " + str(gpio_number))
    print("action : " + action)

    status = "OK"

    if action == "pulse":
        gpio_pulse(gpio_number)
    elif action == "on":
        gpio_on(gpio_number)
    elif action == "off":
        gpio_off(gpio_number)
    else:
        status = "INVALID_ACTION"

    return jsonify({ "status": status })

app.run(host='0.0.0.0', port=5000)


#    /lib/systemd/system/gpio_api.service
  
#    sudo chmod 644 /lib/systemd/system/sample.service
  
#    sudo systemctl daemon-reload
#    sudo systemctl enable gpio_api
#    sudo systemctl start gpio_api