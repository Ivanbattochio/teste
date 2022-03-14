const express = require("express");
const cors = require("cors");
const { json } = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const { exec } = require("child_process");

app.use(json());

const port = process.env.NODE_PORT || 55501;
const secret = process.env.SECRET_GITHUB_PUSH_WEBHOOK;

var jsonParser = bodyParser.json();

app.get("/", (req, res) => {
  console.log("hello world");
  res.send("Hello World!");
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
  console.log(req.headers);
  if (req.headers["X-Hub-Signature-256"] == SECRET_GITHUB_PUSH_WEBHOOK) {
    exec(
      "git pull && sleep 5 && npm install && sleep 10 && sudo systemctl restart pipefy-integration",
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
  }
  res.sendStatus(200);
});

app.post("/card-url", (req, res) => {
  console.log("console log do req.body.card.name", req.body.card.name);
  console.log("console log do req.body no card-url\n", req.body);

  res.status(200).send(res);
});

app.listen(port, function () {
  console.log(`Server running at port ${port}`);
});

module.exports = app;
