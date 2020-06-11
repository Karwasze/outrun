#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
use serde::{Deserialize, Serialize};
mod coords;
mod spotify;
mod parameters;
use crate::coords::Coords;
use crate::parameters::Parameters;
extern crate dotenv;
use dotenv::dotenv;

#[derive(Serialize, Deserialize)]
struct ResultCoords {
    coords: Coords,
    parameters: Parameters,
}

#[get("/coords?<lat>&<long>&<radius>")]
fn get_point(lat: f64, long: f64, radius: f64) -> String {
    let input = Coords {
        lat: lat,
        long: long,
    };
    let rnd_point = coords::random_point(input, radius);
    let point_parameters = parameters::generate_parameters();
    let result = ResultCoords {
        coords: rnd_point,
        parameters: point_parameters,
    };
    let json_result = serde_json::to_string(&result).unwrap();
    json_result
}

#[get("/")]
fn index() -> &'static str {
    "Up and running"
}

fn main() {
    dotenv().ok();
    rocket::ignite()
        .mount("/", routes![index, get_point])
        .launch();
}
