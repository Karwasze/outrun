import telebot
import requests
import random
import os
from dotenv import load_dotenv
load_dotenv()
print("Up and running")
TOKEN = os.getenv("TOKEN")
SERVER_IP = "host.docker.internal"
bot = telebot.TeleBot(TOKEN)

location_data = {}


def gen_message(request):
    result = (
        f"🔴 ANOMALY DETECTED 🔴\n"
        f"Name: {request['parameters']['name']}\n"
        f"Coords: {request['coords']['lat']}, {request['coords']['long']}\n"
        f"Radius: {request['parameters']['radius']} m\n"
        f"{request['parameters']['power']}\n"
        f"Artifact: {request['parameters']['artifact']}\n"
        f"Your hand-picked song: \n{request['parameters']['song']}"
    )
    return result.ljust(25)


@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    bot.reply_to(
        message, "Welcome to the Codex bot! Send your location to begin")


@bot.message_handler(content_types=['location'])
def receive_location(message):
    location_data['lat'] = message.location.latitude
    location_data['long'] = message.location.longitude
    bot.send_message(message.chat.id, "Generating random point...")
    bot.send_message(
        message.chat.id, "Enter distance in which you wish to generate a point (in meters)")
    bot.register_next_step_handler(message, process_distance)


def process_distance(message):
    try:
        if message.text.isdigit():
            lat = location_data['lat']
            long = location_data['long']
            distance = message.text
            r = requests.get(
                f"http://{SERVER_IP}:8000/coords?lat={lat}&long={long}&distance={distance}").json()
            received_lat = r['coords']['lat']
            received_long = r['coords']['long']
            result_location_message = gen_message(r)
            bot.send_message(message.chat.id, result_location_message)
            bot.send_location(message.chat.id, received_lat, received_long)
            requests.get(
                f"http://{SERVER_IP}:8000/update_last_location?telegram_id={message.from_user.id}&lat={received_lat}&long={received_long}&distance={distance}").json()
    except Exception as e:
        bot.reply_to(message, str(e))
        print(str(e))


@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, message.text)


bot.polling()
