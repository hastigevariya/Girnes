import mongoose from "mongoose";

const instaShopSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        url: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model("InstaShop", instaShopSchema);
