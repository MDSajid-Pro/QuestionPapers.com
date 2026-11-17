import QuestionPaper from "../models/questionPapersModel.js";
import { v2 as cloudinary } from 'cloudinary';

// --- Helper: Delete File from Cloudinary ---
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
    }
};

// @desc    Add a new Question Paper
// @route   POST /api/question-paper/add
export const addQuestionPaper = async (req, res) => {
    try {
        const { title, university, course, scheme, year, semester, educationLevel, examType } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "PDF file is required" });
        }

        const newPaper = new QuestionPaper({
            title,
            educationLevel: educationLevel || "DEGREE",
            university: educationLevel === "PUC" ? "Karnataka PU Board (KSEAB)" : university,
            course,
            scheme,
            year,
            semester: educationLevel === "PUC" ? "None" : semester,
            examType: examType || "ANNUAL",
            pdf: req.file.path, 
            cloudinary_id: req.file.filename, 
            isPublished: req.body.isPublished === 'true' || req.body.isPublished === true
        });

        await newPaper.save();

        res.status(201).json({ success: true, message: "Question Paper added successfully", paper: newPaper });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get all Question Papers (with optional educationLevel query filter)
// @route   GET /api/question-paper/all
export const getAllQuestionPapers = async (req, res) => {
    try {
        const { educationLevel } = req.query;
        const filter = educationLevel ? { educationLevel } : {};
        
        const papers = await QuestionPaper.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, papers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
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

        if (req.file) {
            await deleteFromCloudinary(paper.cloudinary_id);
            paper.pdf = req.file.path;
            paper.cloudinary_id = req.file.filename;
        }

        const newEduLevel = req.body.educationLevel || paper.educationLevel;

        paper.title = req.body.title || paper.title;
        paper.educationLevel = newEduLevel;
        paper.university = newEduLevel === "PUC" ? "Karnataka PU Board (KSEAB)" : (req.body.university || paper.university);
        paper.course = req.body.course || paper.course;
        paper.scheme = req.body.scheme || paper.scheme;
        paper.year = req.body.year || paper.year;
        paper.semester = newEduLevel === "PUC" ? "None" : (req.body.semester || paper.semester);
        paper.examType = req.body.examType || paper.examType || "ANNUAL";
        
        if (req.body.isPublished !== undefined) {
             paper.isPublished = req.body.isPublished === 'true' || req.body.isPublished === true;
        }

        await paper.save();

        res.status(200).json({ success: true, message: "Updated successfully", paper });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
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

        await deleteFromCloudinary(paper.cloudinary_id);
        await QuestionPaper.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get Published Questions for Students
export const getAllQuestions = async (req, res) => {
  try {
    const { educationLevel, university, course, semester, scheme, year, examType } = req.query;
    
    let query = { isPublished: true };
    if (educationLevel) query.educationLevel = educationLevel;
    if (university) query.university = university;
    if (course) query.course = course;
    if (scheme) query.scheme = scheme;
    if (year) query.year = year;
    if (examType) query.examType = examType;
    if (semester && semester !== "None") query.semester = semester;

    const questions = await QuestionPaper.find(query).sort({ createdAt: -1 });
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOptions = async (req, res) => {
    try {
        const { field, educationLevel, university, course, semester, scheme, examType } = req.query;

        const eduLevel = educationLevel || "DEGREE";
        let query = { educationLevel: eduLevel };

        // GUARD: Prevent Degree requests from processing PUC board names
        if (eduLevel === "DEGREE" && university === "Karnataka PU Board (KSEAB)") {
            return res.status(200).json([]); // Return empty options for invalid mix
        }

        if (!field) {
            return res.status(400).json({ success: false, message: "Field parameter is required" });
        }

        // 1. UNIVERSITY / BOARD OPTIONS
        if (field === "university") {
            let universities = await QuestionPaper.distinct("university", { educationLevel: eduLevel });
            
            // Filter based on track rules
            if (eduLevel === "DEGREE") {
                universities = universities.filter(
                    (uni) => {
                        const lowerUni = uni.toLowerCase();
                        return !lowerUni.includes("pu") && !lowerUni.includes("kseab");
                    }
                );
            } else {
                universities = universities.filter(
                    (uni) => {
                        const lowerUni = uni.toLowerCase();
                        return !lowerUni.includes("bidar") && !lowerUni.includes("gulbarga");
                    }
                );
            }
            return res.status(200).json(universities);
        }

        // 2. COURSE / STREAM OPTIONS
        if (field === "course") {
            if (university) query.university = university;
            const courses = await QuestionPaper.distinct("course", query);
            return res.status(200).json(courses);
        }

        // 3. SEMESTER OPTIONS
        if (field === "semester") {
            if (eduLevel === "PUC") return res.status(200).json(["None"]);
            if (university) query.university = university;
            if (course) query.course = course;
            const semesters = await QuestionPaper.distinct("semester", query);
            return res.status(200).json(semesters);
        }

        // 4. SCHEME OPTIONS
        if (field === "scheme") {
            if (university) query.university = university;
            if (course) query.course = course;
            if (eduLevel === "DEGREE") {
                if (semester && semester !== "None") query.semester = semester;
            } else {
                query.semester = "None";
            }
            const schemes = await QuestionPaper.distinct("scheme", query);
            return res.status(200).json(schemes);
        }

        // 5. EXAM TYPE OPTIONS
        if (field === "examType" || field === "exam_type") {
            if (university) query.university = university;
            if (course) query.course = course;
            if (eduLevel === "DEGREE") {
                if (semester && semester !== "None") query.semester = semester;
            } else {
                query.semester = "None";
            }
            if (scheme) query.scheme = scheme;
            
            const examTypes = await QuestionPaper.distinct("examType", query);
            return res.status(200).json(examTypes);
        }

        // 6. YEAR OPTIONS
        if (field === "year") {
            if (university) query.university = university;
            if (course) query.course = course;
            if (eduLevel === "DEGREE") {
                if (semester && semester !== "None") query.semester = semester;
            } else {
                query.semester = "None";
            }
            if (scheme) query.scheme = scheme;
            if (examType) query.examType = examType;

            const years = await QuestionPaper.distinct("year", query);
            return res.status(200).json(years);
        }

        return res.status(400).json({ success: false, message: "Invalid field parameter" });

    } catch (error) {
        console.error("Error fetching options:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};