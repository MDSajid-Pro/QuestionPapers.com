import mongoose from "mongoose";

const questionPaperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    university: { type: String, required: true },
    course: { type: String, required: true },
    scheme: { type: String, required: true },
    year: { type: Number, required: true },
    semester: { type: String, required: true },
    pdf: { type: String, required: true },
    cloudinary_id: {
        type: String,
        required: false
    },
    isPublished: { type: Boolean, default: false },
},
    { timestamps: true, versionKey: false }
);


const questionPaperModel = mongoose.model("questionPaper", questionPaperSchema);

export default questionPaperModel;