```
https://centricore.app:8088/scan?visitor_id=xxxxxx&temp=36.8&device_id=xxxxx
https://centricore.app:8088/result?timeout=7000&status=success&visitor_id=xxxxxx&temp=36.8&device_id=xxxxx

http://localhost:8088/scan?visitor_id=ST_000006&temp=36.8&device_id=123
http://localhost:3001/result?timeout=7000&status=success&visitor_id=xxxxxx&temp=36.8&device_id=xxxxx


```

## staff ok

```
http://localhost:8088/scan?visitor_id=ST_000006&temp=36.8&device_id=123
```

## staff not found

```
http://localhost:8088/scan?visitor_id=ST_000006_wrong&temp=36.8&device_id=123
```

## stranger

```
http://localhost:8088/scan?visitor_id=null&temp=36.8&device_id=123
```
