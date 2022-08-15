const { AreaTemplateRelationModel } = require("models");
const logger = require("logger");

class AreaTemplateRelationService {
  static async create(params) {
    const { areaId, templateId } = params;
    if (await AreaTemplateRelationModel.findOne({ areaId, templateId }))
      throw new Error("This template is already assigned to this area");
    const areaTemplateRelation = new AreaTemplateRelationModel({ areaId, templateId });
    const savedRelation = await areaTemplateRelation.save();
    return Promise.resolve(savedRelation);
  }

  static async getAllTemplatesForArea(areaId) {
    logger.info("Get area template ids for area id", areaId);
    const relations = await AreaTemplateRelationModel.find({ areaId });
    logger.info("Got area template ids for area id", areaId, relations);
    return Promise.resolve(relations.map(relation => relation.templateId));
  }

  static async delete(params) {
    const { areaId, templateId } = params;
    const relation = await AreaTemplateRelationModel.findOneAndRemove({ templateId, areaId });
    return Promise.resolve(relation);
  }

  static async deleteAll(filter) {
    await AreaTemplateRelationModel.deleteMany(filter);
    return Promise.resolve();
  }
}

module.exports = AreaTemplateRelationService;
