const axios = require("axios");
const logger = require("logger");
const FormData = require("form-data");
const { createReadStream } = require("fs");
const CoverageService = require("services/coverage.service");
const GeoStoreService = require("services/geostore.service");
const config = require("config");
const loggedInUserService = require("./LoggedInUserService");
const fs = require('fs')

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

  static async getArea(areaId) {
    logger.info("Getting area with id ", areaId);
    try {
      let baseURL = config.get("rwAreasAPI.url");
      const response = await axios.default({
        baseURL,
        url: `/area/${areaId}`,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const area = response.data;
      logger.info("Area", area);
      return area && area.data;
    } catch (e) {
      logger.error("Error while fetching area", e);
      throw e;
    }
  }

  static async delete(areaId) {
    logger.info("Deleting area with id ", areaId);
    try {
      let baseURL = config.get("rwAreasAPI.url");
      const response = await axios.default({
        baseURL,
        url: `/area/${areaId}`,
        method: "DELETE",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const area = response.data;
      logger.info("Area", area);
      return area.data;
    } catch (e) {
      logger.error("Error while deleting area", e);
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

      const form = new FormData();
      form.append("name", name);
      form.append("geostore", geostore.id);
      form.append("image", fs.createReadStream(image.path));

console.log("****************", name, geostore.id, userId)

      const response = await axios.default({
        baseURL,
        url: `/area/fw/${userId}`,
        method: "POST",
        headers: {
          ...form.getHeaders(),
          authorization: loggedInUserService.token
        },
        data: form
      });
      area = response.data;
      console.log(response.data)
      logger.info("Area created", area);
      return { geostore, area: area.data, coverage };
    } catch (e) {
      logger.error("Error while creating area with geostore", e);
      throw e;
    }
  }
}
module.exports = AreasService;
