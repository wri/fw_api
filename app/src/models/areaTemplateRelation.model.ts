const mongoose = require("mongoose");

const { Schema } = mongoose;

const AreaTemplateRelationSchema = new Schema({
  areaId: { type: String, required: true },
  templateId: { type: String, required: true }
});

AreaTemplateRelationSchema.index({ areaId: 1 });

export const AreaTemplateRelationModel = mongoose.model("AreaTemplateRelation", AreaTemplateRelationSchema);

export default AreaTemplateRelationModel;
