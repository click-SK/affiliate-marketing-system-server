import mongoose from "mongoose";

const CreativesSchema = new mongoose.Schema({
    imageText: String,
    imageLink: String,
    videoText: String,
    videoLink: String
}, { timestamps: true });

export default mongoose.model('Creatives',CreativesSchema)