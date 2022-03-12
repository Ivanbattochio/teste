const express = require("express");
const cors = require("cors");
const { json } = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const actuator = require("express-actuator");
app.use(json());

var jsonParser = bodyParser.json();

const options = {
  customEndpoints: [
    {
      id: "dependencies", // used as endpoint /dependencies or ${basePath}/dependencies
      controller: (req, res) => {
        // Controller to be called when accessing this endpoint
        // Your custom code here
      },
    },
  ],
};
app.use(actuator(options));
app.get("/", (req, res) => {
  console.log("hello world");
  res.send("Hello World!!!!!");
});

app.post("/teste", jsonParser, (req, res) => {
  axios
    .post(
      "http://localhost:3000/card-url",
      {
        name: "lucas",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then(function (res) {
      console.log("console log do req.body no teste\n", req.body);
      console.log(res.data);
    })
    .catch(function (error) {
      console.log(error.message);
    });
  res.sendStatus(200);
});

app.post("/card-url", (req, res) => {
  console.log("console log do req.body.card.name", req.body?.card?.name);

  res.status(200).send("mandou no /card-url");
});

app.post("/clicksign", (req, res) => {
  axios.post(
    `${process.env.CLICKSIGN_URL}/v1/templates/${template.key}/documents?access_token=${process.env.CLICKSIGN_ACCESS_TOKEN}`
  );
});

app.listen(3000, function () {
  console.log("server running at port 3000");
});
