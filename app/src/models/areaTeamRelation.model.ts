import mongoose from "mongoose";

const { Schema } = mongoose;

const AreaTeamRelationSchema = new Schema({
  areaId: { type: String },
  teamId: { type: String }
});

AreaTeamRelationSchema.index({ areaId: 1 });

export const AreaTeamRelationModel = mongoose.model("AreaTeamRelation", AreaTeamRelationSchema);

export default AreaTeamRelationModel;
