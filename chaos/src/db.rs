use postgres::{Client, NoTls, Error};
use serde::{Deserialize, Serialize};
use rocket_contrib::json::Json;
use bcrypt::{hash, verify};
use std::error::Error as StdError;
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use rocket::request::{self, Request, FromRequest};
use rocket::Outcome;
use rocket::http::Status;
use crate::coords;

extern crate bcrypt;

const HASHING_COST: u32 = 4;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    company: String,
    exp: usize,
}

#[derive(Serialize, Deserialize)]
pub struct Location {
    pub lat: f64,
    pub long: f64,
    pub distance: f64,
}

#[derive(Serialize, Deserialize)]
pub struct CurrentLocation {
    pub lat: f64,
    pub long: f64,
    pub radius: f64,
    pub power: String,
    pub artifact: String,
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

#[derive(Debug)]
pub enum ApiKeyError {
    Missing,
    Invalid,
}

pub struct ApiKey(pub String);

fn is_valid(key: &str) -> bool {
    let token_secret = dotenv::var("TOKEN_SECRET").unwrap();
    let token_secret = token_secret.as_bytes();
    let key = &key[7..]; //skipping bearer 
    let validation = Validation { sub: Some("outrun".to_string()), ..Validation::default() };
    let token_data = match decode::<Claims>(&key, &DecodingKey::from_secret(token_secret), &validation) {
        Ok(_) => true,
        Err(_) => false,
    };
    token_data
}

impl<'a, 'r> FromRequest<'a, 'r> for ApiKey {
    type Error = ApiKeyError;

    fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
        let keys = request.headers().get_one("Authorization");
        match keys {
            Some(i) if is_valid(i) => Outcome::Success(ApiKey(i.to_string())),
            Some(_) => Outcome::Failure((Status::BadRequest, ApiKeyError::Invalid)),
            None => Outcome::Failure((Status::BadRequest, ApiKeyError::Missing)),
        }
    }
}

pub fn init_db() -> Result<(), Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    client.batch_execute("
    CREATE TABLE IF NOT EXISTS users (
        id      SERIAL PRIMARY KEY,
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

pub fn get_xp(username: &str) -> Result<String, Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let row = client.query_one("SELECT experience FROM users WHERE username = $1", &[&username])?;
    let experience: i32 = row.get("experience");
    let experience = experience.to_string();
    Ok(experience)
}

pub fn add_xp(username: &str, xp_amount: i32) -> Result<(), Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let row = client.query_one("SELECT experience FROM users WHERE username = $1", &[&username])?;
    let experience: i32 = row.get("experience");
    let experience = experience + xp_amount;
    client.execute(
        "UPDATE users SET experience = $1 WHERE username = $2",&[&experience, &username]
    )?;
    Ok(())
}

pub fn update_last_location(username: &str, lat: f64, long: f64, dist: f64) -> Result<(), Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    client.execute(
        "UPDATE users SET lat = $1, long = $2, distance = $3 WHERE username = $4",&[&lat, &long, &dist, &username]
    )?;
    Ok(())
}

pub fn get_last_location(username: &str) -> Result<String, Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let row = client.query_one("SELECT lat, long, distance FROM users WHERE username = $1", &[&username])?;
    let distance: Option<f64> = row.get("distance");
    let lat: Option<f64> = row.get("lat");
    let long: Option<f64> = row.get("long");
    if distance.is_some() {
        let result = Location {
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
    let email = &user.email;
    let empty_mail = &String::new();
    let email = email.as_ref().unwrap_or(empty_mail);
    let experience = 0;

    let row = client.query_opt("SELECT username FROM users WHERE username = $1", &[&username])?;
    match row {
        Some(_row) => {
            return Ok("User already exists".to_string())
        }
        None => (),
    }
    let password = hash(&user.password, HASHING_COST)?;
    client.execute(
        "INSERT INTO users (username, password, email, experience) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING",
        &[&username, &password, &email, &experience],
    )?;
    Ok("User created".to_string())
}

pub fn login_user(user: Json<User>) -> Result<String, Box<dyn StdError>> {
    let token_secret = dotenv::var("TOKEN_SECRET").unwrap();
    let token_secret = token_secret.as_bytes();

    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let username = &user.username;
    let password = &user.password;
    
    let my_claims = Claims { sub: "outrun".to_owned(), company: "outrun".to_owned(), exp: 10000000000 };
    let token = match encode(&Header::default(), &my_claims, &EncodingKey::from_secret(token_secret)) {
        Ok(t) => t,
        Err(_) => return Ok("Error while creating token".to_string())
    };

    let row = client.query_opt("SELECT password FROM users WHERE username = $1", &[&username])?;
    match row {
        Some(_row) => {
            let extracted_password: String = _row.get("password");
            let valid = verify(password, &extracted_password).unwrap();
            if valid {
                Ok(token)
            } else {
                Ok("Invalid password".to_string())
            }
        }
        None => {
            Ok("Username does not exist".to_string())
        },
    }
}

pub fn validate_location(username: &str, current_location: Json<CurrentLocation>) -> Result<String, Error> {
    let last_location = get_last_location(username).unwrap();
    let last_location: Location = serde_json::from_str(&last_location).unwrap();
    let current_location = CurrentLocation {
        lat: current_location.lat,
        long: current_location.long,
        radius: current_location.radius,
        power: current_location.power.clone(),
        artifact: current_location.artifact.clone(),
    };
    let is_valid = check_distance(&last_location, &current_location);
    if is_valid {
        let xp_to_add = calculate_xp(&last_location, &current_location);
        add_xp(&username, xp_to_add)?;
        return Ok(format!("Point validated, xp added: {}", xp_to_add))
    } else {
        return Ok("You are too far away to validate the point, please move closer".to_string())
    }
    
}

fn check_distance(last_location: &Location, current_location: &CurrentLocation) -> bool {
    let distance = coords::calculate_distance(last_location, current_location);
    if distance <= current_location.radius {
        true 
    } else {
        false
    }
}

fn calculate_xp(last_location: &Location, current_location: &CurrentLocation) -> i32 {
    let distance = last_location.distance;
    let power = current_location.power.parse::<f64>().unwrap() / 10.0;
    let artifact = if current_location.artifact == "Arfifact found!" {
       1.5 
    } else {
        1.0
    };
    let xp_to_add = (distance * power * artifact) as i32;
    xp_to_add
}