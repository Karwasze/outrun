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
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)