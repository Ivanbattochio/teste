const log4js = require("log4js");

const CATEGORY = "ivan-pipefy";

const configure = () => {
  let appenders = {};
  console.log("iniciou o configure");
  appenders[CATEGORY] = {
    type: "dateFile",
    filename: `logs/${CATEGORY}.log`,
    pattern: ".yyyy-MM-dd-hh",
    compress: true,
  };
  console.log("passou do category");
  appenders["console"] = {
    type: "console",
  };
  console.log("passou do console");
  log4js.configure({
    appenders: appenders,
    categories: {
      default: {
        appenders: [CATEGORY, "console"],
        level: "debug",
      },
    },
  });
  console.log("passou do log4jsconfigure");
};

module.exports = getLogger = () => {
  return log4js.getLogger(CATEGORY);
};

const handleUncaughtException = () => {
  process.on("uncaughtException", (err) => {
    getLogger().fatal(err);
  });
};

module.exports = initLogger = () => {
  console.log("iniciou o log");
  configure();
  console.log("passou do configure");
  handleUncaughtException();
  console.log("finalizou");
};
