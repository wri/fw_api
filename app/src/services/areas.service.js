const axios = require("axios");
const logger = require("logger");
const { createReadStream } = require("fs");
const CoverageService = require("services/coverage.service");
const GeoStoreService = require("services/geostore.service");
const config = require("config");
const loggedInUserService = require("./LoggedInUserService");

const ALERTS_SUPPORTED = config.get("alertsSupported");

class AreasService {
  static async getUserAreas(userId) {
    logger.info("Get user areas", userId);
    try {
      let baseURL = config.get("areasAPI.url");
      const response = await axios.default({
        baseURL,
        url: `/area/fw`,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const areas = response.data;
      logger.info("User areas", areas);
      return areas && areas.data;
    } catch (e) {
      logger.error("Error while fetching areas", e);
      throw e;
    }
  }

  static async createAreaWithGeostore({ name, image }, geojson, userId) {
    logger.info("Start area creation with params", { name, userId });
    logger.info("Start area creation with geojson", geojson);
    logger.info("Start area creation with image", image);
    let geostore;
    let coverage;
    let area;

    try {
      geostore = await GeoStoreService.createGeostore(geojson);
    } catch (e) {
      logger.error("Error while creating geostore", e);
      throw e;
    }
    try {
      const params = {
        geostoreId: geostore.id,
        slugs: ALERTS_SUPPORTED
      };
      coverage = await CoverageService.getCoverage(params);
    } catch (e) {
      logger.error("Error while getting area coverage", e);
      throw e;
    }
    try {
      logger.info("Creating area with geostore and coverage ready");
      let baseURL = config.get("areasAPI.url");
      const response = await axios.default({
        baseURL,
        url: `/area/fw/${userId}`,
        method: "POST",
        headers: {
          authorization: loggedInUserService.token
        },
        data: {
          name,
          geostore: geostore.id,
          image: createReadStream(image.path)
        }
      });
      area = response.data;
      logger.info("Area created", area);
      return { geostore, area: area.data, coverage };
    } catch (e) {
      logger.error("Error while creating area with geostore", e);
      throw e;
    }
  }
}
module.exports = AreasService;
