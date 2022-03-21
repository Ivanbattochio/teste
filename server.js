const express = require("express");
const cors = require("cors");
const { json } = require("express");
const app = express();
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const crypto = require("crypto-js");
const initLogger = require("./logger.js");
const getLogger = require("./logger.js");
var fs = require("fs");
app.use(cors());

const port = process.env.NODE_PORT || 55501;
const secret = process.env.SECRET_GITHUB_PUSH_WEBHOOK;

const sigHeaderName = "X-Hub-Signature-256";
const sigHashAlg = "sha256";

app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || "utf8");
      }
    },
  })
);

function verifyPostData(req, res, next) {
  if (!req.rawBody) {
    return next("Request body empty");
  }

  const sig = Buffer.from(req.get(sigHeaderName) || "", "utf8");
  const hmac = crypto.createHmac(sigHashAlg, secret);
  const digest = Buffer.from(
    sigHashAlg + "=" + hmac.update(req.rawBody).digest("hex"),
    "utf8"
  );
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return next(
      `Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`
    );
  }
  res.sendStatus(403);
}

initLogger();

app.get("/", (req, res) => {
  console.log("hello world");

  res.send("First Page");
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

app.post("/webhooks/update-repo", verifyPostData, (req, res) => {
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
    }
  );
  res.sendStatus(200);
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
