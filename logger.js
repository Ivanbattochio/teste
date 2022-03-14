const log4js = require("log4js");

const CATEGORY = "ivan-pipefy";

const configure = () => {
  let appenders = {};
  appenders[CATEGORY] = {
    type: "dateFile",
    filename: `logs/${CATEGORY}.log`,
    pattern: ".yyyy-MM-dd-hh",
    compress: true,
  };
  appenders["console"] = {
    type: "console",
  };

  log4js.configure({
    appenders: appenders,
    categories: {
      default: {
        appenders: [CATEGORY, "console"],
        level: "debug",
      },
    },
  });
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
  configure();
  handleUncaughtException();
};
