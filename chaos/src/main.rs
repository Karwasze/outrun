#![feature(proc_macro_hygiene, decl_macro, never_type)]
extern crate rocket;
use chaos;

fn main() {
    chaos::rocket().launch();
}