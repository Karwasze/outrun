
use rocket_contrib::json::Json;
use crate::db;
use crate::coords;
use crate::db::User;
use rocket::http::Status;

#[get("/")]
pub fn index() -> &'static str {
    "Up and running!"
}

#[post("/users", data = "<user>")]
pub fn create_user(user: Json<User>) -> Result<String, Status> { 
    match db::create_user(user) {
        Ok(response) => match response.as_str() {
            "User already exists" => Err(Status::new(401, "User already exists")),
            _ => Ok(response.to_string()),
        }  
        Err(_e) => Err(Status::new(400, "Bad request")),
    }
}

#[post("/login", data = "<user>")]
pub fn login_user(user: Json<User>) -> Result<String, Status> { 
    match db::login_user(user) {
        Ok(response) => match response.as_str() {
            "Invalid password" => Err(Status::new(401, "Invalid password")),
            "Username does not exist" => Err(Status::new(401, "Username does not exist")),
            "Error while creating token" => Err(Status::new(400, "Error while creating token")),
            _ => Ok(response.to_string()),
        }  
        Err(_e) => Err(Status::new(400, "Bad request")),
    }
}

#[get("/coords?<lat>&<long>&<distance>")]
pub fn get_point(lat: f64, long: f64, distance: f64, _key: db::ApiKey) -> Result<String, Status> {
    match coords::get_point(lat, long, distance) {
        Ok(coords) => Ok(coords),
        Err(_e) => Err(Status::new(400, "Error while getting coordinates")),
    }    
}

#[post("/update_last_location?<username>&<lat>&<long>&<distance>")]
pub fn update_last_location(username: String, lat: f64, long: f64, distance: f64, _key: db::ApiKey) -> Result<(), Status> {
    match db::update_last_location(&username, lat, long, distance) {
        Ok(()) => Ok(()),
        Err(_e) => Err(Status::new(400, "Error while updating location")),
    }
}

#[get("/get_xp?<username>")]
pub fn get_xp(username: String, _key: db::ApiKey) -> Result<String, Status> {
    match db::get_xp(&username) {
        Ok(xp) => Ok(xp),
        Err(_e) => Err(Status::new(400, "Error while getting xp")),
    }
}

#[post("/add_xp?<username>&<xp_amount>")]
pub fn add_xp(username: String, xp_amount: i32, _key: db::ApiKey) -> Result<(), Status> {
    match db::add_xp(&username, xp_amount) {
        Ok(()) => Ok(()),
        Err(_e) => Err(Status::new(400, "Error while adding xp")),
    }
}

#[get("/get_last_location?<username>")]
pub fn get_last_location(username: String, _key: db::ApiKey) -> Result<String, Status> {
    match db::get_last_location(&username) {
        Ok(location) => Ok(location),
        Err(_e) => Err(Status::new(400, "Error while retrieving location")),
    }
}