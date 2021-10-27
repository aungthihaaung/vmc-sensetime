```
sudo chmod 644 /lib/systemd/system/gpio_api.service
sudo systemctl daemon-reload
sudo systemctl enable gpio_api
sudo systemctl start gpio_api
```

## gpio_api.service

- path /lib/systemd/system/gpio_api.service

```
[Unit]
Description=GPIO API
After=multi-user.target

[Service]
Type=idle
ExecStart=/usr/bin/python3 /home/pi/Documents/apps/gpio-api/main.py

[Install]
WantedBy=multi-user.target
```

## disable gpio flicker at /boot/config.txt

```
dtoverlay=gpio-poweroff,gpiopin=14,active_low
```

## patch
- scp -r dir copy is not working & no idea why
```

scp D:\GitHub\vmc-sensetime\gpio-api\main.py pi@172.16.101.204:/home/pi/Documents/apps/gpio-api/main.py
scp D:\GitHub\vmc-sensetime\gpio-api\config.py pi@172.16.101.204:/home/pi/Documents/apps/gpio-api/config.py
scp D:\GitHub\vmc-sensetime\gpio-api\note.md pi@172.16.101.204:/home/pi/Documents/apps/gpio-api/note.md

scp D:\GitHub\vmc-sensetime\gpio-api\main.py pi@172.16.101.206:/home/pi/Documents/apps/gpio-api/main.py
scp D:\GitHub\vmc-sensetime\gpio-api\config.py pi@172.16.101.206:/home/pi/Documents/apps/gpio-api/config.py
scp D:\GitHub\vmc-sensetime\gpio-api\note.md pi@172.16.101.206:/home/pi/Documents/apps/gpio-api/note.md

scp D:\GitHub\vmc-sensetime\gpio-api\main.py pi@172.16.101.208:/home/pi/Documents/apps/gpio-api/main.py
scp D:\GitHub\vmc-sensetime\gpio-api\config.py pi@172.16.101.208:/home/pi/Documents/apps/gpio-api/config.py
scp D:\GitHub\vmc-sensetime\gpio-api\note.md pi@172.16.101.208:/home/pi/Documents/apps/gpio-api/note.md

```