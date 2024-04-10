import express from 'express';
import sslChecker from 'ssl-checker';
import TelegramApi from 'node-telegram-bot-api';
import 'dotenv/config.js';

const PORT = process.env.PORT || 5000;
const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramApi(token, {polling: true});

const app = express();

const sslCheck = async (url) => {
  console.log('url = ', url)
  try {
    const check = await sslChecker(url, { method: "GET", port: 443 })  
    const validTo = new Date(check.validTo);
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
    if (validTo < currentDate) {
      return `SSL сертифікат для ${url} просрочений, дата закінчення ${validTo.toDateString()}`
    } else if (validTo <= sevenDaysAgo && validTo >= currentDate) {
      return `SSL сертифікат для ${url} невдовзі закінчиться, дата закінчення ${validTo.toDateString()}`
    } else {
      return `SSL сертифікат для ${url} дійсний, дата закінчення ${validTo.toDateString()}`
    }
  } catch (error) {
    console.log({error, msg: "ERROR"})
    return 'Домен не знайдено! Введіть домен в такомиу вигдяді example.com.ua'
  }
}

app.get('/', (req, res) => {
  res.send('Service working');
})

async function start() {
  try {
    app.listen(PORT, () => {
      console.log("Server sterted on port" + PORT);
    })
    bot.setMyCommands([
      {command: '/start', description: 'Запустити бота'},
    ])

    bot.on('message', async (msg) => {
      let chatId = msg.chat.id;
      let msgText = msg.text;
      if (msgText) {
        if (msg.text === '/start') {
          return bot.sendMessage(chatId, 'Цей бот може перевіряти ssl сертифікати на сайтах. Для цього потрібно ввести домен без протоколів та слешів.\nНаприкалда: google.com\nThis bot can check ssl certificates on websites. To do this, you need to enter a domain without protocols and slashes.\nFor example: google.com');
        } else {
          const result = await sslCheck(msgText);
          if (result) {
            console.log(result)
            return bot.sendMessage(chatId, result);
          } else {
            return bot.sendMessage(chatId, "Введіть домен в такомиу вигдяді example.com.ua");
          }
        }
      }
    });
  } catch (error) {
    console.log(error)
  }
}

async function sendMessageToGroup() {
  const chatId = -4182447123; // id групи
  let sites = ['porsche.ua', 'procreditbank.com.ua', 'winner.ua', 'pcb-v5.mysitedemo.co.uk', 'kharkiv.volvocarsdealer.com', 
  'dnipro.volvocarsdealer.com'];
  sites.forEach(async (element) => {
    const result = await sslCheck(element);
    if (result) {
      console.log(result)
      return bot.sendMessage(chatId, result);
    }
  })
}

setInterval(sendMessageToGroup, 1*60*1000);

start();