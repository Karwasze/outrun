use postgres::{Client, NoTls, Error};
use serde::{Deserialize, Serialize};
use rocket_contrib::json::Json;
use bcrypt::{hash, verify};
use std::error::Error as StdError;
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};
extern crate bcrypt;

const HASHING_COST: u32 = 4;
const TOKEN_SECRET: &[u8] = b"TRNVLDT";

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    company: String,
    exp: usize,
}

#[derive(Serialize, Deserialize)]
struct LastLocation {
    lat: f64,
    long: f64,
    distance: f64,
}

#[derive(Serialize, Deserialize)]
struct EmptyResult {
    err: bool,
}

#[derive(Deserialize, Debug)]
pub struct User {
    username: String,
    password: String,
    email: Option<String>,
}

pub fn init_db() -> Result<(), Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    client.batch_execute("
    CREATE TABLE IF NOT EXISTS users (
        id      SERIAL PRIMARY KEY,
        telegram_id    VARCHAR(20) UNIQUE,
        username    TEXT UNIQUE,
        password    TEXT,
        email   TEXT,
        experience      INTEGER,
        lat    DOUBLE PRECISION,
        long    DOUBLE PRECISION,
        distance    DOUBLE PRECISION
    )
")?;
    Ok(())
}

pub fn create_user_if_doesnt_exist(telegram_id: &str) -> Result<(), Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let experience = 0;

    client.execute(
        "INSERT INTO users (telegram_id, experience) VALUES ($1, $2) ON CONFLICT (telegram_id) DO NOTHING",
        &[&telegram_id, &experience],
    )?;
    Ok(())
}

pub fn get_xp(telegram_id: &str) -> Result<String, Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let row = client.query_one("SELECT experience FROM users WHERE telegram_id = $1", &[&telegram_id])?;
    let experience: i32 = row.get("experience");
    let experience = experience.to_string();
    Ok(experience)
}

pub fn add_xp(telegram_id: &str, xp_amount: i32) -> Result<(), Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let row = client.query_one("SELECT experience FROM users WHERE telegram_id = $1", &[&telegram_id])?;
    let experience: i32 = row.get("experience");
    let experience = experience + xp_amount;
    client.execute(
        "UPDATE users SET experience = $1 WHERE telegram_id = $2",&[&experience, &telegram_id]
    )?;
    Ok(())
}

pub fn update_last_location(telegram_id: &str, lat: f64, long: f64, dist: f64) -> Result<(), Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    client.execute(
        "UPDATE users SET lat = $1, long = $2, distance = $3 WHERE telegram_id = $4",&[&lat, &long, &dist, &telegram_id]
    )?;
    Ok(())
}

pub fn get_last_location(telegram_id: &str) -> Result<String, Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let row = client.query_one("SELECT lat, long, distance FROM users WHERE telegram_id = $1", &[&telegram_id])?;
    let distance: Option<f64> = row.get("distance");
    let lat: Option<f64> = row.get("lat");
    let long: Option<f64> = row.get("long");
    if distance.is_some() {
        let result = LastLocation {
            lat: lat.unwrap(),
            long: long.unwrap(),
            distance: distance.unwrap(),
        };
        Ok(serde_json::to_string(&result).unwrap())
    }
    else {
        let result = EmptyResult {
            err: true,
        }; 
        Ok(serde_json::to_string(&result).unwrap())
    }
}


pub fn create_user(user: Json<User>) -> Result<String, Box<dyn StdError>> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let username = &user.username;
    let email = &user.email.as_ref().unwrap();
    let row = client.query_opt("SELECT username FROM users WHERE username = $1", &[&username])?;
    match row {
        Some(_row) => {
            return Ok(String::from("User already exists"))
        }
        None => (),
    }
    let password = hash(&user.password, HASHING_COST)?;
    client.execute(
        "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING",
        &[&username, &password, &email],
    )?;
    Ok(String::from("User created"))
}

pub fn login_user(user: Json<User>) -> Result<String, Box<dyn StdError>> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let username = &user.username;
    let password = hash(&user.password, HASHING_COST)?;
    
    let row = client.query_opt("SELECT username FROM users WHERE username = $1 AND password = $2", &[&username, &password])?;
    match row {
        Some(_row) => {
            return Ok(String::from("Login successful"))
        }
        None => (),
    }

    let my_claims = Claims { sub: "b@b.com".to_owned(), company: "ACME".to_owned(), exp: 10000000000 };
    let token = match encode(&Header::default(), &my_claims, &EncodingKey::from_secret(TOKEN_SECRET)) {
        Ok(t) => t,
        Err(_) => "Error while creating token".to_string()
    };
    Ok(token)
}