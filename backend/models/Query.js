import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Resolved'], 
    default: 'Pending' 
  },
  adminResponse: { type: String, default: "" }, // To store your reply
}, { timestamps: true });

const Query = mongoose.model("Query", querySchema);

export default Query;
