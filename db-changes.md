## cd_controller

```
alter table cd_controller add sensetime_device_id varchar(20)
alter table cd_controller add pi_gpio_number int
```

## device_event

```
alter table device_event add temperature decimal(3,1)
alter table device_event add safeentry_status varchar(1)
alter table device_event add staff_reg_id bigint
alter table device_event add personnel_id bigint
alter table device_event add controller_id int
```
