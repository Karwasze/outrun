#![feature(proc_macro_hygiene, decl_macro, never_type)]
#[macro_use]
extern crate rocket;
extern crate dotenv;
pub mod paths;
mod db;
mod coords;
mod spotify;
mod parameters;
use dotenv::dotenv;
use rocket::Rocket;

pub fn rocket() -> Rocket {
    dotenv().ok();
    match db::init_db() {
        Ok(()) => println!("Up and running!"),
        Err(e) => println!("Error: {}", e),
    }
    rocket::ignite()
        .mount("/", routes![
            paths::index, 
            paths::get_point, 
            paths::get_xp, 
            paths::add_xp, 
            paths::update_last_location, 
            paths::get_last_location, 
            paths::create_user, 
            paths::login_user,
            ])
}