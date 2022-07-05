const { AreaTeamRelationModel } = require("models");
const logger = require("logger");

class AreaTeamRelationService {
  static async create(params) {
    const { areaId, teamId } = params;
    if (await AreaTeamRelationModel.findOne({ areaId, teamId }))
      throw new Error("This team is already assigned to this area");
    const areaTeamRelation = new AreaTeamRelationModel({ areaId, teamId });
    const savedRelation = await areaTeamRelation.save();
    return Promise.resolve(savedRelation);
  }

  static async getAllTeamsForArea(areaId) {
    logger.info("Get area team ids for area id", areaId);
    const relations = await AreaTeamRelationModel.find({ areaId });
    logger.info("Got area team ids for area id", areaId, relations);
    return Promise.resolve(relations.map(relation => relation.teamId));
  }

  static async getAllAreasForTeam(teamId) {
    logger.info("Get team area ids for team id", teamId);
    const relations = await AreaTeamRelationModel.find({ teamId });
    logger.info("Got team area ids for team id", teamId, relations);
    return Promise.resolve(relations.map(relation => relation.areaId));
  }

  static async delete(params) {
    const { areaId, teamId } = params;
    let relation = await AreaTeamRelationModel.findOneAndDelete({ teamId, areaId });
    return Promise.resolve(relation);
  }

  static async deleteAll(filter) {
    await AreaTeamRelationModel.deleteMany(filter);
    return Promise.resolve();
  }
}

module.exports = AreaTeamRelationService;
