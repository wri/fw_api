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
        url: `/teams/user/${userId}`,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const teams = response.data;
      logger.info("Got users teams", teams);
      return teams && teams.data;
    } catch (e) {
      logger.error("Error while fetching teams", e);
      return null; // log the error but still return
    }
  }

  static async getTeam(teamId) {
    logger.info(`Getting team with id ${teamId}`);
    try {
      const baseURL = config.get("teamsAPI.url");
      const response = await axios.default({
        baseURL,
        url: `/teams/${teamId}`,
        method: "GET",
        headers: {
          authorization: loggedInUserService.token
        }
      });
      const team = response.data;
      logger.info("Got team", team);
      return team && team.data;
    } catch (e) {
      logger.error("Error while fetching team", e);
      return null; // log the error but still return
    }
  }
}
module.exports = TeamService;
