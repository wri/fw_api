import { AreaTemplateRelationModel } from "../models";

export default class AreaTemplateRelationService {
  static async create(params) {
    const { areaId, templateId } = params;
    const areaTemplateRelation = new AreaTemplateRelationModel({ templateId, areaId });
    const savedRelation = await areaTemplateRelation.save();
    return Promise.resolve(savedRelation);
  }

  static async getAllTemplatesForArea(areaId) {
    const relations = await AreaTemplateRelationModel.find({ areaId });
    return Promise.resolve(relations.map(relation => relation.templateId));
  }

  static async delete(params) {
    const { areaId, templateId } = params;
    await AreaTemplateRelationModel.findOneAndDelete({ templateId, areaId });
    return Promise.resolve();
  }
}
