<h1 align="center">Waze Card for Home Assistant</h1>

<p align="center">
  <img src='https://i.imgur.com/PrqeVYJ.png' />
</p>

<h2>Features</h2>

* Show distance and duration for a list of waze routes
* Click on route to open Waze app
* Show best route to take
* Supports Metric and Imperial systems via HA global settings

<h2>Track Updates</h2>

This custom card can be tracked with the help of [custom-updater](https://github.com/custom-components/custom_updater).

In your configuration.yaml

```
custom_updater:
  card_urls:
    - https://raw.githubusercontent.com/ljmerza/waze-card/master/custom_updater.json
```

<h1>Usage</h1>
<h2>Prerequisites</h2>
You should have setup Waze integration and zones in HomeAssistant.

<h2>Options</h2>

| Name | Type | Requirement | `Default` Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:waze-card`
| header | boolean | **Optional** | `true` show header
| title | string | **Optional** | `Waze Routes` Header text shown at top of card
| entities | object | **Required** | List of routes to display
| columns | list | **Optional** | `name, distance, duration, route` Which columns to display
| custom_distance | string | **Optional** |  Override HA distance unit settings (set to `km` or `mi`)
| custom_distance_units | string | **Optional** | `HA default setting` Override units string (`km` or `mi`)

<h3>`entities` Options:</h3>

| Name | Type | Requirement | `Default` Description
| ---- | ---- | ------- | -----------
| entity | string | **Required** | The waze sensor entity to use 
| zone | string | **Optional** | Used to enable click to open waze app (needs coordinates to work)
| name | string | **Optional** | `friendly_name from Waze config` The name of the route


<h2>Configuration</h2>

Download `waze-card.js` from the [latest release](https://github.com/ljmerza/waze-card/releases/latest/) and upload it your /www folder of your Home Assistant config directory.

In your ui-lovelace.yaml

```
resources:
  - url: /local/waze-card/waze-card.js?v=2.0.0
    type: js
```

Add the custom card to views:

```
views:
  cards:
    - type: custom:waze-card
      entities:
        - entity: sensor.waze_home # used to show data on card
          zone: zone.home # needed to get lat/long for clicking on waze route
          name: Home
        - entity: sensor.waze_work
          zone: zone.work
          name: Work
```

or minimum setup (disables clicking to open waze):

```
views:
  cards:
    - type: custom:waze-cardq
      entities:
        - entity: sensor.waze_home
        - entity: sensor.waze_work
```
