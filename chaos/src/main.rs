#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
mod coords;
mod spotify;
mod parameters;
mod db;
extern crate dotenv;
use dotenv::dotenv;

#[get("/coords?<lat>&<long>&<distance>")]
fn get_point(lat: f64, long: f64, distance: f64) -> String {
    coords::get_point(lat, long, distance)
}

#[get("/update_last_location?<telegram_id>&<lat>&<long>&<distance>")]
fn update_last_location(telegram_id: String, lat: f64, long: f64, distance: f64) -> String {
    
    match db::create_user_if_doesnt_exist(&telegram_id) {
        Ok(()) => println!("Created user or already exists"),
        Err(e) => println!("Error: {}", e),
    }
    db::update_last_location(&telegram_id, lat, long, distance).unwrap()
}

#[get("/get_xp?<telegram_id>")]
fn get_xp(telegram_id: String) -> String {
    db::get_xp(&telegram_id).unwrap()
}

#[get("/add_xp?<telegram_id>&<xp_amount>")]
fn add_xp(telegram_id: String, xp_amount: i32) -> String {
    db::add_xp(&telegram_id, xp_amount).unwrap()
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
        .mount("/", routes![index, get_point, get_xp, add_xp, update_last_location])
        .launch();
}
