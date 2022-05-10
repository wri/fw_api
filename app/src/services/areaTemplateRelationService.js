const { AreaTemplateRelationModel } = require("models");

class AreaTemplateRelationService {
  static async create(params) {
    const { areaId, templateId } = params;
    console.log(areaId, templateId)
    if (await AreaTemplateRelationModel.findOne({ areaId, templateId }))
      throw new Error("This template is already assigned to this area");
    const areaTemplateRelation = new AreaTemplateRelationModel({ templateId, areaId });
    console.log("something", areaTemplateRelation)
    const savedRelation = await areaTemplateRelation.save();
    console.log("relation", savedRelation)
    return Promise.resolve(savedRelation);
  }

  static async getAllTemplatesForArea(areaId) {
    const relations = await AreaTemplateRelationModel.find({ areaId });
    return Promise.resolve(relations.map(relation => relation.templateId));
  }

  static async delete(params) {
    const { areaId, templateId } = params;
    const relation = await AreaTemplateRelationModel.findOneAndDelete({ templateId, areaId });
    return Promise.resolve(relation);
  }

  static async deleteAll(filter) {
    await AreaTemplateRelationModel.deleteMany(filter);
    return Promise.resolve();
  }
}

module.exports = AreaTemplateRelationService;
