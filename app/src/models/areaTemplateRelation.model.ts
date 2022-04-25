import mongoose from "mongoose";

const { Schema } = mongoose;

const AreaTemplateRelationSchema = new Schema({
  areaId: { type: String },
  templateId: { type: String }
});

AreaTemplateRelationSchema.index({ areaId: 1 });

export const AreaTemplateRelationModel = mongoose.model("AreaTemplateRelation", AreaTemplateRelationSchema);

export default AreaTemplateRelationModel;
