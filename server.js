const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const crypto = require("crypto");
const axios = require("axios");
var fs = require("fs");
const util = require("util");
const nodemailer = require("nodemailer");
require("dotenv").config();

const port = process.env.NODE_PORT || 55501;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("deu boa!!").status(200);
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
    console.log("assinatura invalida");
    throw new Error("Invalid signature.");
  } else {
    console.log("assinatura valida");
    exec(
      "cd /plantview/ivan-pipefy-integration/teste && git pull && sleep 5 && npm install && sleep 10 && sudo systemctl restart pipefy-integration",
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
  }
});

app.post("/webhooks/pipefy/302289021", (req, res) => {
  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "80462d026c341a",
      pass: "15ea8e28de7dea",
    },
  });
  axios
    .post(
      process.env.NODE_PIPEFY_URL,
      {
        query: `{card(id:${req.body.data.card.id}){ fields { name, value , field { id } }}}`,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NODE_PIPEFY_TOKEN}`,
        },
      }
    )
    .then((res) => {
      transport.sendMail(
        {
          from: "testeemail@hotmail.com",
          to: "ivanborgo@outlook.com",
          subject: "Teste de body",
          text: `
          res.data abaixo \n
          ${res.data}
          res.data.card abaixo \n
          ${res.data.card}
          res.data.data abaixo \n
          ${res.data.data}

          `,
        },
        (err, info) => {
          console.log(info.envelope);
          console.log(info.messageId);
        }
      );
    })
    .catch((err) => {
      console.log(err);
      transport.sendMail(
        {
          from: "testeemail@hotmail.com",
          to: "ivanborgo@outlook.com",
          subject: "Teste de body",
          text: `
          res.body.data.card.fields abaixo \n
          ${err.message}
          erro completo
          ${err}
          `,
        },
        (err, info) => {
          console.log(info.envelope);
          console.log(info.messageId);
        }
      );
    });

  res.sendStatus(200);
}); //pipe teste - processo de compras

app.listen(port, function () {
  console.log(`Server running at port ${port}`);
});

module.exports = app;
