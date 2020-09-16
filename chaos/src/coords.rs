extern crate rand;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::f64::consts;
use crate::parameters;
use crate::parameters::Parameters;
const EARTH_RADIUS: f64 = 6371000.0;

#[derive(Debug, Serialize, Deserialize)]
pub struct Coords {
    pub lat: f64,
    pub long: f64,
    pub distance: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResultCoords {
    pub coords: Coords,
    pub parameters: Parameters,
}

pub fn calculate_distance(last_location: &ResultCoords, current_location: &Coords) -> f64 {
    let last_location = Coords {
        lat: last_location.coords.lat.to_radians(),
        long: last_location.coords.long.to_radians(),
        distance: last_location.coords.distance,
    };
    
    let current_location = Coords {
        lat: current_location.lat.to_radians(),
        long: current_location.long.to_radians(),
        distance: current_location.distance,
    };

    let delta = Coords {
        lat:  ((current_location.lat - last_location.lat) / 2.0).sin(),
        long: ((current_location.long - last_location.long) / 2.0).sin(),
        distance: 0.0,
    };

    let a = delta.lat * delta.lat + delta.long * delta.long * (last_location.lat).cos() * (current_location.lat).cos();
    
    let result = EARTH_RADIUS * 2.0 * (a.sqrt()).atan2((1.0 - a).sqrt());
    result    
}
pub fn point_at_distance(coords: Coords) -> Coords {
    let mut rng = rand::thread_rng();

    let coords_rad = Coords {
        lat: coords.lat.to_radians(),
        long: coords.long.to_radians(),
        distance: coords.distance,
    };
    let sin_lat = coords_rad.lat.sin();
    let cos_lat = coords_rad.lat.cos();

    let bearing: f64 = rng.gen::<f64>() * consts::PI * 2.0;
    let theta = coords.distance / EARTH_RADIUS;
    let sin_bearing = bearing.sin();
    let cos_bearing = bearing.cos();
    let sin_theta = theta.sin();
    let cos_theta = theta.cos();

    let result_lat = (sin_lat * cos_theta + cos_lat * sin_theta * cos_bearing).asin();
    let result_long = coords_rad.long
        + (sin_bearing * sin_theta * cos_lat).atan2(cos_theta - sin_lat * result_lat.sin());
    let result_long = ((result_long + (consts::PI * 3.0)) % (consts::PI * 2.0)) - consts::PI;
    let result = Coords {
        lat: result_lat.to_degrees(),
        long: result_long.to_degrees(),
        distance: coords.distance,
    };
    result
}

pub fn random_point(coords: Coords) -> Coords {
    let mut rng = rand::thread_rng();
    let random_distance = rng.gen::<f64>().sqrt() * coords.distance;
    let coords = Coords {
        distance: random_distance,
        ..coords
    };
    let result = point_at_distance(coords);
    result
}

pub fn get_point(lat: f64, long: f64, distance: f64) -> Result<String, serde_json::Error> {
    let input = Coords {
        lat: lat,
        long: long,
        distance: distance,
    };
    let rnd_point = random_point(input);
    let point_parameters = parameters::generate_parameters();
    let result = ResultCoords {
        coords: rnd_point,
        parameters: point_parameters,
    };
    serde_json::to_string(&result)
}