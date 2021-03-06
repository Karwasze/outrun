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
use crate::coords::ResultCoords;
use crate::coords::Coords;

extern crate bcrypt;

const HASHING_COST: u32 = 4;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    company: String,
    exp: usize,
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
        id    SERIAL PRIMARY KEY,
        username    TEXT UNIQUE,
        password    TEXT,
        email    TEXT,
        experience    INTEGER,
        last_location    TEXT  
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

pub fn update_last_location(username: &str, current_location: Json<ResultCoords>) -> Result<(), Error> {
    let last_location = current_location.into_inner();
    let last_location = serde_json::to_string(&last_location).unwrap();
    println!("{:?}", last_location);
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    client.execute(
        "UPDATE users SET last_location = $1 WHERE username = $2",&[&last_location, &username]
    )?;
    Ok(())
}

pub fn get_last_location(username: &str) -> Result<String, Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let row = client.query_one("SELECT last_location FROM users WHERE username = $1", &[&username])?;
    let last_location: String = row.get("last_location");
    Ok(last_location)
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

pub fn validate_location(username: &str, current_location: Json<Coords>) -> Result<String, Error> {
    let last_location = get_last_location(username).unwrap();
    let last_location: ResultCoords = serde_json::from_str(&last_location).unwrap();
    let is_valid = check_distance(&last_location, &current_location);
    if is_valid {
        let xp_to_add = calculate_xp(&last_location);
        add_xp(&username, xp_to_add)?;
        return Ok(format!("Point validated, experience added: {}", xp_to_add))
    } else {
        return Ok("You are too far away to validate the point, please move closer".to_string())
    }
    
}

fn check_distance(last_location: &ResultCoords, current_location: &Coords) -> bool {
    let distance = coords::calculate_distance(last_location, current_location);
    if distance <= last_location.parameters.radius.into() {
        true 
    } else {
        false
    }
}

fn calculate_xp(last_location: &ResultCoords) -> i32 {
    let distance = last_location.coords.distance;
    let power = last_location.parameters.power.parse::<f64>().unwrap() / 10.0;
    let artifact = if last_location.parameters.artifact == "Arfifact found!" {
       1.5 
    } else {
        1.0
    };
    let xp_to_add = (distance.powf(1.1) * power * artifact) as i32;
    xp_to_add
}