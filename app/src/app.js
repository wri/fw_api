const Koa = require("koa");
const logger = require("logger");
const koaLogger = require("koa-logger");
const validate = require("koa-validate");
const loader = require("loader");
const convert = require("koa-convert");
const ErrorSerializer = require("serializers/error.serializer");
const koaSimpleHealthCheck = require("koa-simple-healthcheck");
const loggedInUserService = require("./services/LoggedInUserService");
const koaBody = require("koa-body")({
  multipart: true,
  jsonLimit: "50mb",
  formLimit: "50mb",
  textLimit: "50mb"
});

const app = new Koa();
validate(app);

app.use(convert(koaBody));

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
      logger.error(error);
    } else {
      logger.info(error);
    }

    ctx.body = ErrorSerializer.serializeError(ctx.status, error.message);
    if (process.env.NODE_ENV === "prod" && ctx.status === 500) {
      ctx.body = "Unexpected error";
    }
    ctx.response.type = "application/vnd.api+json";
  }
});

app.use(koaLogger());
app.use(koaSimpleHealthCheck());

app.use(async (ctx, next) => {
  await loggedInUserService.setLoggedInUser(ctx, logger);
  await next();
});

loader.loadRoutes(app);

const server = app.listen(process.env.PORT, () => {});

logger.info("Server started in ", process.env.PORT);

module.exports = server;
