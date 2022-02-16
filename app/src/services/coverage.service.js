const logger = require("logger");
const deserializer = require("serializers/deserializer");
const axios = require("axios");
const loggedInUserService = require("./LoggedInUserService");
const config = require("config");

class CoverageService {
  static async getCoverage({ geostoreId, slugs }) {
    const uri = `/coverage/intersect?geostore=${geostoreId}${slugs ? `&slugs=${slugs}` : ""}`;
    logger.info("Getting coverage with geostore id and uri", geostoreId, uri);
    try {
      const baseURL = config.get("geostoreAPI.url");
      const response = await axios.default({
        baseURL,
        url: uri,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const coverage = response.data;
      logger.info("Got coverage", coverage);
      return deserializer(coverage);
    } catch (e) {
      logger.error("Error while fetching coverage", e);
      throw e;
    }
  }
}
module.exports = CoverageService;
