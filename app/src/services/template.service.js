const logger = require("logger");
const deserializer = require("serializers/deserializer");
const axios = require("axios");
const loggedInUserService = require("./LoggedInUserService");
const config = require("config");

class TemplateService {
  static async getTemplate(templateId) {
    logger.info("Getting template with id", templateId);
    try {
      const baseURL = config.get("formsAPI.url");
      const response = await axios.default({
        baseURL,
        url: `/reports/${templateId}`,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const template = response.data;
      logger.info("Got template", template);
      return deserializer(template);
    } catch (e) {
      logger.error("Error while fetching template", e);
      return null; // log the error but still return
    }
  }

  static async getDefaultTemplate() {
    logger.info("Getting default template ");
    try {
      const baseURL = config.get("formsAPI.url");
      const response = await axios.default({
        baseURL,
        url: `/reports/default`,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const template = response.data;
      logger.info("Got template", template);
      return deserializer(template);
    } catch (e) {
      logger.error("Error while fetching template", e);
      return null; // log the error but still return
    }
  }
}
module.exports = TemplateService;
