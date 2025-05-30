import mongoose from "mongoose";

// const aboutSchema = new mongoose.Schema({
//     content: String,
// }, { timestamps: true });

// export const aboutUsModel = mongoose.model("aboutus", aboutSchema);
const aboutSchema = new mongoose.Schema({
    p1: String,
    p2: String,
    p3: String,
    p4: String,
    m1: String,
    m2: String,
    m3: String,
    m4: String,
    image: String,
}, { timestamps: true });
export const aboutUsModel = mongoose.model("aboutus", aboutSchema);