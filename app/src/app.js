const Koa = require("koa");
const cors = require("@koa/cors");
const config = require("config");
const logger = require("logger");
const koaLogger = require("koa-logger");
const validate = require("koa-validate");
const loader = require("loader");
const convert = require("koa-convert");
const ErrorSerializer = require("serializers/error.serializer");
const loggedInUserService = require("./services/LoggedInUserService");
const mongoose = require("mongoose");
const koaBody = require("koa-body")({
  multipart: true,
  jsonLimit: "50mb",
  formLimit: "50mb",
  textLimit: "50mb",
  fileLimit: "50mb"
});
const Sentry = require("@sentry/node");

const app = new Koa();

/**
 * Sentry
 */
Sentry.init({
  dsn: "https://2ddcb5b7116844b9a7c79626d121c566@o163691.ingest.sentry.io/6263597",
  environment: process.env.NODE_ENV
});

app.on("error", (err, ctx) => {
  Sentry.withScope(function (scope) {
    scope.addEventProcessor(function (event) {
      return Sentry.Handlers.parseRequest(event, ctx.request);
    });
    Sentry.captureException(err); // send fatal errors to sentry
  });
});
/** */

let dbSecret = config.get("mongodb.secret");
if (typeof dbSecret === "string") {
  dbSecret = JSON.parse(dbSecret);
}

const mongoURL =
  "mongodb://" +
  `${dbSecret.username}:${dbSecret.password}` +
  `@${config.get("mongodb.host")}:${config.get("mongodb.port")}` +
  `/${config.get("mongodb.database")}` +
  "?authSource=admin";

const onDbReady = err => {
  if (err) {
    logger.error(err);
    throw new Error(err);
  }
};

mongoose.connect(mongoURL, onDbReady);

app.use((ctx, next) => {
  return next().then(function () {
    ctx.set("Cache-Control", "private");
  });
});
app.use(convert(koaBody));
app.use(cors());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (inErr) {
    let error = inErr;
    try {
      error = JSON.parse(inErr);
    } catch (e) {
      logger.debug("Could not parse error message - is it JSON?: ", inErr);
      error = inErr;
    }
    ctx.status = error.status || ctx.status || 500;
    if (ctx.status >= 500) {
      Sentry.captureException(error); // send error to sentry
      logger.error(error);
    } else {
      logger.info(error);
    }

    ctx.body = ErrorSerializer.serializeError(ctx.status, error.message);
    if (process.env.NODE_ENV === "production" && ctx.status === 500) {
      ctx.body = "Unexpected error";
    }
    ctx.response.type = "application/vnd.api+json";
  }
});

validate(app);
app.use(koaLogger());

app.use(async (ctx, next) => {
  await loggedInUserService.setLoggedInUser(ctx, logger);
  await next();
});

loader.loadRoutes(app);

const server = app.listen(config.get("service.port"), () => {
  logger.info("Server started in ", config.get("service.port"));
  logger.info("Server token ", config.get("service.token"));
});

module.exports = server;
