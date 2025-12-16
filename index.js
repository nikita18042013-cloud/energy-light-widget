import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// простой кеш (15 минут)
let cache = null;
let cacheTime = 0;

app.get("/api/light", async (req, res) => {
  const now = Date.now();
  if (cache && now - cacheTime < 15 * 60 * 1000) {
    return res.json(cache);
  }

  try {
    const response = await fetch("https://energy-ua.info/cherga/1-2");
    const html = await response.text();
    const $ = cheerio.load(html);

    // ⚠️ селекторы примерные, уточним
    const status =
      $("body").text().includes("Світ є") ? "Світ є" : "Світ відсутній";

    const next = $(".next").first().text().trim() || null;

    cache = {
      queue: "1–2",
      status,
      next,
      updated: new Date().toISOString()
    };

    cacheTime = now;
    res.json(cache);
  } catch (e) {
    res.status(500).json({ error: "parser_error" });
  }
});

app.listen(PORT, () => {
  console.log("Server started on", PORT);
});
