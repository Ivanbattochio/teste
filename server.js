const express = require("express");
const cors = require("cors");
const { json } = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const { exec } = require("child_process");
const crypto = require("crypto-js");
const initLogger = require("./logger.js");

var fs = require("fs");
const { getLogger } = require("log4js");

app.use(json());

const port = process.env.NODE_PORT || 55501;
const secret = process.env.SECRET_GITHUB_PUSH_WEBHOOK;

initLogger();
var jsonParser = bodyParser.json();

app.get("/", (req, res) => {
  console.log("hello world");
  var logText = fs
    .readFileSync("./logs/ivan-pipefy.log")
    .toString()
    .split("\n")
    .map((line) => line.split("] ["))
    .reduce((acc, cur) => {
      acc[cur[0]] = cur[1];
      return acc;
    }, {});

  res.send(logText);
});

app.post("/teste", jsonParser, (req, res) => {
  axios
    .post("https://teste-ivory.vercel.app/card-url", {
      card: req.body,
    })
    .then(function (response) {
      console.log("console log do req.data no teste\n", req.data);
      console.log("console log do req.body no teste\n", req.body);
      res.status(200);
    })
    .catch(function (error) {
      console.log(error.message);
    });
});

app.post("/webhooks/update-repo", (req, res) => {
  /*console.log(req.headers);
  const decrypt = crypto.SHA256(req.headers["X-Hub-Signature-256"]);
  const HMACdigest = crypto.HmacSHA256()
  console.log(decrypt);
  console.log(secret);
  if (decrypt == secret) {
    
  }*/

  exec(
    "cd /plantview/ivan-pipefy-integration/teste && sudo git pull && sleep 5 && sudo npm install && sleep 10 && sudo systemctl restart pipefy-integration",
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
    }
  );
  res.sendStatus(200);
});

app.post("/webhooks/pipefy/302289021", (req, res) => {
  getLogger().info(`O body da req.body.name é ${req.body?.name}\n`);
  getLogger().info(`O body da req.body.card é ${req.body?.card}\n`);
  getLogger().info(
    `O body da req.body.card.attachments é ${req.body?.card?.attachments}\n`
  );

  res.sendStatus(200);
}); //pipe teste - processo de compras

app.post("/card-url", (req, res) => {
  getLogger().info(`O body da req é ${req.body.name}\n`);
  console.log("console log do req.body.card.name", req.body?.card?.name);
  console.log("console log do req.body no card-url\n", req.body);

  res.sendStatus(200);
});

app.listen(port, function () {
  console.log(`Server running at port ${port}`);
});

module.exports = app;
