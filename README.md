# Outrun

Outrun is a Telegram bot that assigns you a random point of interest based on your location.

## Setup
### Dependencies
* Docker (tested on Docker Engine 19.03)
* Rust nightly (tested on 1.45)

### Config
To create your own bot you have to provide two .env files, one for the **Chaos** (backend), and the second for the **Codex** (Telegram frontend) 

* **Chaos** .env file should contain **CLIENT_TOKEN** variable, which is the base64 encoded client_id and client_secret from Spotify App API. To learn how to get it visit https://developer.spotify.com/documentation/ios/quick-start/#register-a-developer-app
    ```bash
    CLIENT_TOKEN="Basic <base64 encoded client_id:client_secret>"
    ```
* **Codex** .env file should contain **TOKEN** variable, which is the Telegram bot API key. To learn how to obtain it, visit https://core.telegram.org/bots#6-botfather
    ```bash
    TOKEN=<telegram_bot_api_key>
    ```

## Usage
Run both Chaos and Codex and you're ready to go.
* Chaos
From the **chaos/** directory run
```bash
cargo run
```

* Codex
From the **codex/** directory run
```bash
docker build .
```
and then
```bash
docker run codex
```

## Chaos API
```
GET /coords?<lat>&<long>&<distance> (get_point)
```
Returns random point in a maximum distance specified. Point is also annotated with a name, radius of returned point, power level, whether it found an artifact, and a link to a random spotify song.

Example input:

```
/coords?lat=51.122056&long=17.046372&distance=500
```

Example output:  

```
{
    coords: {
        lat: 51.12623436349294,
        long: 17.048292027292185
    },
    parameters: {
        name: "Tidy diamond",
        radius: 69,
        power: "Power: 0",
        artifact: "Arfifact found!",
        song: "https://open.spotify.com/track/7ARveOiD31w2Nq0n5FsSf8"
    }
}
```
---
```
GET /get_xp?<telegram_id> (get_xp)
```
Returns experience points assigned to gived telegram ID. Returns 0 when user does not exist.

Example input:

```
/get_xp?telegram_id=123456789
```

Example output:
```
4200
```
---
```
POST /add_xp?<telegram_id>&<xp_amount> (add_xp)
```
Returns experience points assigned to gived telegram ID after adding the provided amount. Creates a new user if he does not exist.

Example input:

```
/add_xp?telegram_id=123456789&xp_amount=1
```

Example output:
```
Status: 200 OK
```
---
```
POST /update_last_location?<telegram_id>&<lat>&<long>&<distance> (update_last_location)
```
Updates last generated location of a provided telegram user with a new latitude, longitude, and distance. 

Example input:

```
/update_last_location?telegram_id=123456789&lat=51.12345&long=16.12345&distance=100
```

Example output:
```
Status: 200 OK
```
---
```
GET /get_last_location?<telegram_id> (get_last_location)
```
Gets last location saved from a provided user. 

Example input:

```
/get_last_location?telegram_id=123456789
```

Example output:
```
{
    lat: 51.123456,
    long: 17.123456,
    distance: 100
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)