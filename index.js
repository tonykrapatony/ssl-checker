import express from 'express';
import TelegramApi from 'node-telegram-bot-api';
import 'dotenv/config.js';
import sslCheck from './helpers/sslCheck.js';
import sites from './helpers/sites.js';

const PORT = process.env.PORT || 5000;
const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramApi(token, {polling: true});

const app = express();

bot.setMyCommands([
  {command: '/start', description: 'Запустити бота'},
])

bot.on('message', async (msg) => {
  let chatId = msg.chat.id;
  let msgText = msg.text;
  if (msgText) {
    if (msgText.match('/start')) {
      const chatInfo = await bot.getChat(chatId);
      return bot.sendMessage(chatId, 'Цей бот може перевіряти ssl сертифікати на сайтах. Для цього потрібно ввести домен без протоколів та слешів.\nНаприкалда: google.com\nThis bot can check ssl certificates on websites. To do this, you need to enter a domain without protocols and slashes.\nFor example: google.com');
    } else {
      const result = await sslCheck(msgText);
      if (result) {
        return bot.sendMessage(chatId, result);
      } else {
        return bot.sendMessage(chatId, "Введіть домен в такомиу вигдяді example.com.ua");
      }
    }
  }
});

async function sendMessageToGroup() {
  const chatId = process.env.CHAT_ID;
  for (const element of sites) {
    const result = await sslCheck(element);
    if (result) {
      bot.sendMessage(chatId, result);
    }
  }
}

setInterval(sendMessageToGroup, 30*1000);

export function startServer() {
  app.get('/', (req, res) => {
    res.send('Service working');
  })

  app.listen(PORT, () => {
    console.log("Server started on port" + PORT);
  })
}

startServer();