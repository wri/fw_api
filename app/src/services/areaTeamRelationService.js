const { AreaTeamRelationModel } = require("models");

class AreaTeamRelationService {
  static async create(params) {
    const { areaId, teamId } = params;
    if (await AreaTeamRelationModel.findOne({ areaId, teamId }))
      throw new Error("This team is already assigned to this area");
    const areaTeamRelation = new AreaTeamRelationModel({ teamId, areaId });
    const savedRelation = await areaTeamRelation.save();
    return Promise.resolve(savedRelation);
  }

  static async getAllTeamsForArea(areaId) {
    const relations = await AreaTeamRelationModel.find({ areaId });
    return Promise.resolve(relations.map(relation => relation.teamId));
  }

  static async delete(params) {
    const { areaId, teamId } = params;
    await AreaTeamRelationModel.findOneAndDelete({ teamId, areaId });
    return Promise.resolve();
  }
}

module.exports = AreaTeamRelationService;
