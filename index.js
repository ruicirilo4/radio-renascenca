const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const port = 56189;

app.use(express.static("public"));

// Create an array to store recent songs
const recentSongs = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/now-playing", async (req, res) => {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: "wss://chrome.browserless.io?token=9883aff7-00df-4cef-a4e2-e583303a1975",
    });
    const page = await browser.newPage();

    await page.goto("https://rr.sapo.pt/ouvir-emissao/SVV3Tjg3d2Q5eEw3bmRGV3hVaUV0Mkd0UEV6VXByWDF1NnV3SWxOVWQ3RT0");

    await page.waitForSelector(".infoMusic", { timeout: 180000 });

    const nowPlayingInfo = await page.$eval(".infoMusic", (element) =>
      element.textContent.trim()
    );

    await browser.close();

    if (nowPlayingInfo !== "-" && nowPlayingInfo !== "" && !recentSongs.includes(nowPlayingInfo)) {
      recentSongs.unshift(nowPlayingInfo);

      if (recentSongs.length > 10) {
        recentSongs.pop();
      }
    }

    res.send(nowPlayingInfo);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error");
  }
});

app.get("/recent-songs", (req, res) => {
  const filteredRecentSongs = recentSongs.filter((song) => song !== "-" && song !== "");
  res.json(filteredRecentSongs);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
