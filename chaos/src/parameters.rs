use rand::seq::SliceRandom;
use rand::Rng;
use serde::{Deserialize, Serialize};
use crate::spotify;


#[derive(Serialize, Deserialize)]
pub struct Parameters {
    pub name: String,
    pub radius: u32,
    pub power: String,
    pub artifact: String,
    pub song: String,
}

const ADJECTIVES: &'static [&'static str] = &[
    "Nostalgic",
    "Receptive",
    "Purple",
    "Extra-large",
    "Tidy",
    "Sincere",
    "Dirty",
    "Tasty",
    "Salty",
    "Electronic",
    "Rainy",
    "Sick",
    "Fearless",
];
const NOUNS: &'static [&'static str] = &[
    "dad",
    "power",
    "food",
    "bonus",
    "disk",
    "revolution",
    "union",
    "chest",
    "dirt",
    "reception",
    "rain",
    "sicko",
    "stranger",
    "championship",
    "complaint",
    "diamond",
];

fn generate_name() -> String {
    let adjective = ADJECTIVES
        .choose(&mut rand::thread_rng())
        .unwrap()
        .to_string();
    let noun = NOUNS.choose(&mut rand::thread_rng()).unwrap().to_string();
    format!("{} {}", adjective, noun)
}

pub fn generate_parameters() -> Parameters {
    let mut rng = rand::thread_rng();
    let power = rng.gen_range(0, 11);
    let artifact_cond = rand::random();
    let name = generate_name();
    let artifact = if artifact_cond {
        "Arfifact found!"
    } else {
        "No artifact"
    };
    let song = spotify::generate_song();
    Parameters {
        name: name,
        radius: rng.gen_range(50, 301),
        power: power.to_string(),
        artifact: artifact.to_string(),
        song: song,
    }
}