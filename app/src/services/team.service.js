const logger = require("logger");
const axios = require("axios");
const loggedInUserService = require("./LoggedInUserService");
const config = require("config");

class TeamService {
  static async getUserTeams(userId) {
    logger.info("Getting user's teams");
    try {
      const baseURL = config.get("teamsAPI.url");
      const response = await axios.default({
        baseURL,
        url: `/user/${userId}`,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const teams = response.data;
      logger.info("Got users teams", teams);
      return teams;
    } catch (e) {
      logger.error("Error while fetching teams", e);
      return null; // log the error but still return
    }
  }
}
module.exports = TeamService;
