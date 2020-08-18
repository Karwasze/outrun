#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
mod coords;
mod spotify;
mod parameters;
mod db;
extern crate dotenv;
use dotenv::dotenv;
use rocket_contrib::json::Json;
use crate::db::User;

#[get("/coords?<lat>&<long>&<distance>")]
fn get_point(lat: f64, long: f64, distance: f64) -> String {
    coords::get_point(lat, long, distance)
}

#[post("/update_last_location?<telegram_id>&<lat>&<long>&<distance>")]
fn update_last_location(telegram_id: String, lat: f64, long: f64, distance: f64) -> () {
    match db::create_user_if_doesnt_exist(&telegram_id) {
        Ok(()) => println!("Created user or already exists"),
        Err(e) => println!("Error: {}", e),
    }
    match db::update_last_location(&telegram_id, lat, long, distance) {
        Ok(()) => println!("Updated location"),
        Err(e) => println!("Error: {}", e),
    }
}

#[get("/get_xp?<telegram_id>")]
fn get_xp(telegram_id: String) -> String {
    match db::create_user_if_doesnt_exist(&telegram_id) {
        Ok(()) => println!("Created user or already exists"),
        Err(e) => println!("Error: {}", e),
    }
    db::get_xp(&telegram_id).unwrap()
}

#[post("/add_xp?<telegram_id>&<xp_amount>")]
fn add_xp(telegram_id: String, xp_amount: i32) -> () {
    match db::create_user_if_doesnt_exist(&telegram_id) {
        Ok(()) => println!("Created user or already exists"),
        Err(e) => println!("Error: {}", e),
    }
    match db::add_xp(&telegram_id, xp_amount) {
        Ok(()) => println!("Added xp"),
        Err(e) => println!("Error: {}", e),
    }
}

#[get("/get_last_location?<telegram_id>")]
fn get_last_location(telegram_id: String) -> String {
    match db::create_user_if_doesnt_exist(&telegram_id) {
        Ok(()) => println!("Created user or already exists"),
        Err(e) => println!("Error: {}", e),
    }
    db::get_last_location(&telegram_id).unwrap()
}

#[post("/users", data = "<user>")]
fn create_user(user: Json<User>) -> String { 
    println!("{:?}", user);
    db::create_user(user).unwrap()
}

#[post("/login", data = "<user>")]
fn login_user(user: Json<User>) -> String { 
    println!("{:?}", user);
    db::login_user(user).unwrap()
}
#[get("/")]
fn index() -> &'static str {
    "Up and running!"
}

fn main() {
    dotenv().ok();
    match db::init_db() {
        Ok(()) => println!("Up and running!"),
        Err(e) => println!("Error: {}", e),
    }
    rocket::ignite()
        .mount("/", routes![index, get_point, get_xp, add_xp, update_last_location, get_last_location, create_user, login_user])
        .launch();
}
