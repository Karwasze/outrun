use postgres::{Client, NoTls, Error};

pub fn init_db() -> Result<(), Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    client.batch_execute("
    CREATE TABLE IF NOT EXISTS users (
        id      SERIAL PRIMARY KEY,
        telegram_id    VARCHAR(20) UNIQUE,
        experience      INTEGER,
        lat    DOUBLE PRECISION,
        long    DOUBLE PRECISION,
        distance    DOUBLE PRECISION
    )
")?;
    Ok(())
}

pub fn create_user_if_doesnt_exist(telegram_id: &str) -> Result<(), Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let experience = 0;

    client.execute(
        "INSERT INTO users (telegram_id, experience) VALUES ($1, $2) ON CONFLICT (telegram_id) DO NOTHING",
        &[&telegram_id, &experience],
    )?;
    Ok(())
}

pub fn get_xp(telegram_id: &str) -> Result<String, Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let row = client.query_one("SELECT experience FROM users WHERE telegram_id = $1", &[&telegram_id])?;
    let experience: i32 = row.get("experience");
    let experience = experience.to_string();
    Ok(experience)
}

pub fn add_xp(telegram_id: &str, xp_amount: i32) -> Result<String, Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    let row = client.query_one("SELECT experience FROM users WHERE telegram_id = $1", &[&telegram_id])?;
    let experience: i32 = row.get("experience");
    let experience = experience + xp_amount;
    client.execute(
        "UPDATE users SET experience = $1 WHERE telegram_id = $2",&[&experience, &telegram_id]
    )?;
    let experience = experience.to_string();
    Ok(experience)
}

pub fn update_last_location(telegram_id: &str, lat: f64, long: f64, dist: f64) -> Result<String, Error> {
    let mut client = Client::connect("host=localhost user=postgres dbname=outrun_testing", NoTls)?;
    client.execute(
        "UPDATE users SET lat = $1, long = $2, distance = $3 WHERE telegram_id = $4",&[&lat, &long, &dist, &telegram_id]
    )?;
    let row = client.query_one("SELECT distance FROM users WHERE telegram_id = $1", &[&telegram_id])?;
    let distance: f64 = row.get("distance");
    let distance = distance.to_string();
    Ok(distance)
}