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
