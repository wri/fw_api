import mongoose from "mongoose";

const { Schema } = mongoose;

const AreaTeamRelationSchema = new Schema({
  areaId: { type: String, required: true },
  teamId: { type: String, required: true }
});

AreaTeamRelationSchema.index({ areaId: 1 });

export const AreaTeamRelationModel = mongoose.model("AreaTeamRelation", AreaTeamRelationSchema);

export default AreaTeamRelationModel;
