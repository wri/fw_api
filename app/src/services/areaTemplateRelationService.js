const AreaTemplateRelationModel = require("models/areaTemplateRelation.model");
const logger = require("logger");
const config = require("config");
//const TemplateService = require("./template.service");

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
    // get default template and add if not already included
    let templates = relations.map(relation => relation.templateId.toString());
    const defaultTemplate = config.get("defaultTemplate");
    if (!templates.includes(defaultTemplate)) templates.push(defaultTemplate);
    logger.info("Got area template ids for area id", areaId, templates);
    return Promise.resolve(templates);
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
