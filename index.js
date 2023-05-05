import express from "express";
import { Telegraf } from "telegraf";
import cheerio from "cheerio";
import axios from "axios";

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Set the bot API endpoint
app.use(await bot.createWebhook({ domain: webhookDomain }));

try {
  bot.start((ctx) => ctx.reply("Welcome"));
  bot.help((ctx) => ctx.reply("Send me a sticker"));
  bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
  bot.hears(/[\w]{1,10}-[\w]{1,10}/, (ctx) => {
    console.log("fanhao", ctx.message);
    const messageId = ctx.message.message_id;
    ctx
      .reply("匹配成功,请稍等...", {
        reply_to_message_id: messageId,
      })
      .then((msgInfo) => {
        setTimeout(() => {
          ctx.telegram.editMessageText(
            msgInfo.chat.id,
            msgInfo.message_id,
            undefined,
            "暫未實裝該功能🤗"
          );
        }, 2000);
      });
  });

  bot.hears("hzy", async (ctx) => {
    console.log("hzy", ctx.message);
    const date2CST = (dateString) => {
      const pattern =
        /(\d{4})年(\d{1,2})月(\d{1,2})日 \((.)\)\s*(\d{1,2}):(\d{2})/;
      const [, year, month, day, weekday, hour, minute] =
        dateString.match(pattern);
      const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
      return (
        date.toLocaleDateString("zh-CN") +
        " " +
        date.toLocaleTimeString("zh-CN", { hourCycle: "h23" })
      );
    };
    const url =
      "https://zh.wiktionary.org/w/index.php?title=Special:%E7%94%A8%E6%88%B7%E8%B4%A1%E7%8C%AE/Hzy980512&target=Hzy980512&limit=10";
    axios
      .get(url)
      .then((response) => {
        const html = response;
        const $ = cheerio.load(html);
        const lastItem = $(".mw-contributions-list li").first();
        const lastDate = lastItem.find(".mw-changeslist-date").text();
        const lastWord = lastItem.find(".mw-contributions-title").text();
        console.log("lastDate", `${lastDate} ${lastWord}`);
        ctx.reply(`${date2CST(lastDate)} ${lastWord}`, {
          reply_to_message_id: ctx.message.message_id,
        });
      })
      .catch((err) => {
        console.log(err);
        ctx.telegram.sendMessage(
          ctx.message.from.id,
          `網絡錯誤! Status: ${err}`
        );
      });
  });

  bot.on("message", (ctx) => {
    console.log(ctx.message);
    ctx.reply("Hello World!");
  });
} catch (error) {
  console.log(error);
}

app.listen(port, () => console.log("Listening on port", port));
