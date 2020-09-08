
use rocket_contrib::json::Json;
use crate::db;
use crate::coords;
use crate::db::User;

#[get("/")]
pub fn index() -> &'static str {
    "Up and running!"
}

#[post("/users", data = "<user>")]
pub fn create_user(user: Json<User>) -> String { 
    println!("{:?}", user);
    match db::create_user(user) {
        Ok(user) => user,
        Err(e) => e.to_string(),
    }
}

#[post("/login", data = "<user>")]
pub fn login_user(user: Json<User>) -> String { 
    match db::login_user(user) {
        Ok(user) => user.to_string(),
        Err(e) => e.to_string(),
    }
}

#[get("/coords?<lat>&<long>&<distance>")]
pub fn get_point(lat: f64, long: f64, distance: f64, _key: db::ApiKey) -> String {
    match coords::get_point(lat, long, distance) {
        Ok(coords) => coords,
        Err(_e) => "Error while getting coordinates".to_string(),
    }
}

#[post("/update_last_location?<username>&<lat>&<long>&<distance>")]
pub fn update_last_location(username: String, lat: f64, long: f64, distance: f64, _key: db::ApiKey) -> () {
    match db::update_last_location(&username, lat, long, distance) {
        Ok(()) => println!("Updated location"),
        Err(e) => println!("Error: {}", e),
    }
}

#[get("/get_xp?<username>")]
pub fn get_xp(username: String, _key: db::ApiKey) -> String {
    match db::get_xp(&username) {
        Ok(xp) => xp,
        Err(_e) => "Error while getting xp".to_string(),
    }
}

#[post("/add_xp?<username>&<xp_amount>")]
pub fn add_xp(username: String, xp_amount: i32, _key: db::ApiKey) -> () {
    match db::add_xp(&username, xp_amount) {
        Ok(()) => println!("Added xp"),
        Err(e) => println!("Error: {}", e),
    }
}

#[get("/get_last_location?<username>")]
pub fn get_last_location(username: String, _key: db::ApiKey) -> String {
    match db::get_last_location(&username) {
        Ok(location) => location,
        Err(_e) => "Error while getting location".to_string(),
    }
}