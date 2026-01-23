import QuestionPaper from "../models/questionPapersModel.js";
import { v2 as cloudinary } from 'cloudinary';

// --- Helper: Delete File from Cloudinary ---
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        // Cloudinary requires the public_id to delete
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
    }
};

// @desc    Add a new Question Paper
// @route   POST /api/question-paper/add
export const addQuestionPaper = async (req, res) => {
    try {
        const { title, university, course, scheme, year, semester } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "PDF file is required" });
        }

        const newPaper = new QuestionPaper({
            title,
            university,
            course,
            scheme,
            year,
            semester,
            // 1. Save the Secure URL (for frontend access)
            pdf: req.file.path, 
            // 2. Save the Public ID (for deletion later)
            cloudinary_id: req.file.filename, 
            isPublished: req.body.isPublished === 'true'
        });

        await newPaper.save();

        res.status(201).json({ success: true, message: "Question Paper added successfully", paper: newPaper });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all Question Papers
// @route   GET /api/question-paper/all
export const getAllQuestionPapers = async (req, res) => {
    try {
        const papers = await QuestionPaper.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, papers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update Question Paper
// @route   PUT /api/question-paper/:id
export const updateQuestionPaper = async (req, res) => {
    try {
        const { id } = req.params;
        const paper = await QuestionPaper.findById(id);

        if (!paper) {
            return res.status(404).json({ success: false, message: "Paper not found" });
        }

        // If a new file is uploaded, delete old from Cloudinary and update paths
        if (req.file) {
            // 1. Delete the old PDF from Cloudinary
            await deleteFromCloudinary(paper.cloudinary_id);

            // 2. Update with new file info
            paper.pdf = req.file.path;
            paper.cloudinary_id = req.file.filename;
        }

        // Update other fields
        paper.title = req.body.title || paper.title;
        paper.university = req.body.university || paper.university;
        paper.course = req.body.course || paper.course;
        paper.scheme = req.body.scheme || paper.scheme;
        paper.year = req.body.year || paper.year;
        paper.semester = req.body.semester || paper.semester;
        
        if (req.body.isPublished !== undefined) {
             paper.isPublished = req.body.isPublished === 'true';
        }

        await paper.save();

        res.status(200).json({ success: true, message: "Updated successfully", paper });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete Question Paper
// @route   DELETE /api/question-paper/:id
export const deleteQuestionPaper = async (req, res) => {
    try {
        const { id } = req.params;
        const paper = await QuestionPaper.findById(id);

        if (!paper) {
            return res.status(404).json({ success: false, message: "Paper not found" });
        }

        // 1. Delete from Cloudinary
        await deleteFromCloudinary(paper.cloudinary_id);

        // 2. Delete from DB
        await QuestionPaper.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await QuestionPaper.find({ isPublished: true });
      res.json({ success: true, questions });
  } catch (error) {
    res.json({success: false, message: error.message});
  }
}