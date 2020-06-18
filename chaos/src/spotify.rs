use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use serde_json::Value;
use std::collections::HashMap;

fn construct_headers(token: String) -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&token).unwrap());
    headers
}

fn get_song_from_spotify(token: String) -> Result<String, reqwest::Error> {
    let client = reqwest::blocking::Client::new();
    let res = client.get("https://api.spotify.com/v1/recommendations?limit=1&market=US&seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_tracks=0c6xIDDpzE81m2q797ordA&min_popularity=50")
        .headers(construct_headers(token))
        .send()?;
    res.text()
}

fn parse_response_from_spotify(received_json: String) -> String {
    let v: Value = serde_json::from_str(&received_json).unwrap();
    let result = v["tracks"][0]["external_urls"]["spotify"]
        .to_string()
        .replace('\"', "");
    result
}

fn spotify_token_refresh() -> String {
    let res = get_new_token().unwrap();
    parse_spotify_token(res)
}

fn get_new_token() -> Result<String, reqwest::Error> {
    let mut params = HashMap::new();
    params.insert("grant_type", "client_credentials");
    let client_token = dotenv::var("CLIENT_TOKEN").unwrap();
    let client = reqwest::blocking::Client::new();
    let res = client
        .post("https://accounts.spotify.com/api/token")
        .body("grant_type=client_credentials")
        .header(AUTHORIZATION, client_token)
        .form(&params)
        .send()?;
    res.text()
}

fn parse_spotify_token(received_json: String) -> String {
    let v: Value = serde_json::from_str(&received_json).unwrap();
    let result = v["access_token"].to_string().replace('\"', "");
    ["Bearer ", &result].join(" ").to_owned()
}

pub fn generate_song() -> String {
    let token = spotify_token_refresh();
    let res = get_song_from_spotify(token).unwrap();
    parse_response_from_spotify(res)
}