const express = require("express");
const cors = require("cors");
const { json } = require("express");
const app = express();
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const crypto = require("crypto");
const initLogger = require("./logger.js");
const getLogger = require("./logger.js");
var fs = require("fs");
app.use(cors());
require("dotenv").config();

const port = process.env.NODE_PORT || 55501;
const secret = process.env.NODE_SECRET_GITHUB_PUSH_WEBHOOK;

app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || "utf8");
      }
    },
  })
);

initLogger();

app.get("/", (req, res) => {
  res.send("deu boa").status(200);
});

app.get("/log", (req, res) => {
  var logText = fs
    .readFileSync(
      "./plantview/ivan-pipefy-integration/teste/logs/ivan-pipefy.log"
    )
    .toString()
    .split("\n")
    .map((line) => line.split("] ["))
    .reduce((acc, cur) => {
      acc[cur[0]] = cur[1];
      return acc;
    }, {});

  res.send(logText);
});

app.post("/webhooks/update-repo", (req, res) => {
  const signature = req.headers["x-hub-signature"];

  const expectedSignature =
    "sha1=" +
    crypto
      .createHmac("sha1", process.env.NODE_SECRET_GITHUB_PUSH_WEBHOOK)
      .update(JSON.stringify(req.body))
      .digest("hex");

  if (signature !== expectedSignature) {
    throw new Error("Invalid signature.");
  } else {
    exec(
      "cd /plantview/ivan-pipefy-integration/teste && git pull && sleep 5 && npm install && sleep 10 && systemctl restart pipefy-integration",
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        getLogger().info("Passou da validaçao!");
      }
    );
    res.sendStatus(200);
  }
});

app.post("/webhooks/pipefy/302289021", (req, res) => {
  getLogger().info(
    `O body da req.body.name é ${
      req.body && req.body.name ? req.body.name : ""
    }\n`
  );
  getLogger().info(
    `O body da req.body.card é  ${
      req.body && req.body.card ? req.body.card : ""
    }\n`
  );
  getLogger().info(
    `O body da req.body.card.attachments é ${
      req.body && req.body.card.attachments ? req.body.card.attachments : ""
    }\n`
  );

  res.sendStatus(200);
}); //pipe teste - processo de compras

app.post("/card-url", (req, res) => {
  res.send(req.body);
});

app.listen(port, function () {
  console.log(`Server running at port ${port}`);
});

module.exports = app;
