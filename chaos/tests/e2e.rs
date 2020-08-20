#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

use chaos::paths;

fn rocket() -> rocket::Rocket {
    rocket::ignite().mount("/", routes![paths::index])
}

fn main() {
    rocket().launch();
}

#[cfg(test)]
mod test {
    use super::rocket;
    use rocket::local::Client;
    use rocket::http::Status;

    #[test]
    fn test_hello() {
        let client = Client::new(rocket()).unwrap();
        let mut response = client.get("/").dispatch();
        assert_eq!(response.status(), Status::Ok);
        assert_eq!(response.body_string(), Some("Up and running!".into()));
    }
}