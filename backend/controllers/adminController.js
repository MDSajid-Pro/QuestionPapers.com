import jwt from 'jsonwebtoken'
import questionPaperModel from '../models/questionPapersModel.js';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.json({
        success: false,
        message: 'Invalid Email'
      })
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.json({
        success: false,
        message: 'Invalid Password'
      })
    }
    
    const token = jwt.sign({ email }, process.env.JWT_SECRET)
    res.json({success: true,token })
    
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}

export const getAllQuestionsAdmin = async(req, res) => {
  try {
    const questions = await questionPaperModel.find({}).sort({ createdAt: -1 })
    res.json({success: true,questions })
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}

export const getDashboard = async (req, res) => {
  try {
    const questions = await questionPaperModel.countDocuments();

    const dashboardData = {
      questions
    }

    res.json({success: true, dashboardData})

  } catch (error) {
    res.json({success: false, message: error.message})
  }
}