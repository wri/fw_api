//import mongoose from "mongoose"
import { AreaTemplateRelationModel } from "../models";

export default class AreaTemplateRelationService {
  static async create(params) {
    const { areaId, templateId } = params;
    const areaTemplateRelation = new AreaTemplateRelationModel({ templateId, areaId });
    await areaTemplateRelation.save();
  }

  static async getAllTemplatesForArea(areaId) {
    const relations = await AreaTemplateRelationModel.find({ areaId });
    return relations.map(relation => relation.templateId);
  }

  static async delete(params) {
    const { areaId, templateId } = params;
    await AreaTemplateRelationModel.findOneAndDelete({ templateId, areaId });
    return Promise.resolve();
  }
}
