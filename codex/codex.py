import telebot
import requests
import random
import os
from dotenv import load_dotenv
from telebot import types
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
    reply = (
        "Welcome to the Codex bot! \n\n"
        "Select the paperclip button and choose \"Location\" and send your current location to begin. \n\n "
        "Press \"Generate point of interest\" to generate a new random location. \n"
        "Press \"Mark point of interest as visited\" while being near your generated point of interest to gain experience. \n\n"
        "Type \"/exp\" to view your experience points"
    )
    bot.reply_to(message, reply)


@bot.message_handler(commands=['exp'])
def get_experience(message):
    xp = requests.get(
        f"http://{SERVER_IP}:8000/get_xp?telegram_id={message.from_user.id}").json()
    bot.reply_to(
        message, f"Your current XP is {xp}")


@bot.message_handler(content_types=['location'])
def receive_location(message):
    location_data['lat'] = message.location.latitude
    location_data['long'] = message.location.longitude

    markup = types.ReplyKeyboardMarkup(row_width=1, one_time_keyboard=True)
    itembtn1 = types.KeyboardButton('Generate point of interest')
    itembtn2 = types.KeyboardButton('Mark point of interest as visited')
    markup.add(itembtn1, itembtn2)
    bot.send_message(
        message.chat.id, "What would you like to do?", reply_markup=markup)
    bot.register_next_step_handler(message, process_answer)


def process_answer(message):
    markup = types.ReplyKeyboardRemove(selective=False)
    bot.send_message(message.chat.id, "Processing...",
                     reply_markup=markup)
    if message.text == "Generate point of interest":
        bot.send_message(
            message.chat.id, "Enter distance in which you wish to generate a point (in meters)")
        bot.register_next_step_handler(message, process_distance)
    elif message.text == "Mark point of interest as visited":
        visit_point(message)
    else:
        bot.send_message(
            message.chat.id, "Unexpected error occured")


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


def visit_point(message):
    try:
        xp_amount = 100
        result = requests.get(
            f"http://{SERVER_IP}:8000/add_xp?telegram_id={message.from_user.id}&xp_amount={xp_amount}").json()
        bot.send_message(message.chat.id, result)
    except Exception as e:
        bot.reply_to(message, str(e))
        print(str(e))


@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, message.text)


bot.polling()
