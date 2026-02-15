import Query from '../models/Query.js';
import transporter from '../config/nodemailer.js'

// 1. PUBLIC: Post a new query
export const createQuery = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newQuery = new Query({ name, email, message });
    await newQuery.save();
    
    res.status(201).json({ message: "Query sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send query", details: error.message });
  }
};

// 2. ADMIN: Get all queries
export const getAllQueries = async (req, res) => {
  try {
    // Sort by newest first (createdAt: -1)
    const queries = await Query.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch queries", details: error.message });
  }
};

// 3. UPDATE: Update Status & Send Email
export const updateQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    
    // Auto-resolve if responding
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.status = 'Resolved'; 
    }

    const updatedQuery = await Query.findByIdAndUpdate(
      id, updateData, { new: true }
    );
    
    if (!updatedQuery) return res.status(404).json({ error: "Query not found" });

    // --- EMAIL LOGIC (BREVO) ---
    if (adminResponse) {
      const mailOptions = {
        from: `"Admin Support" <${process.env.SMTP_USER}>`, // Sender address
        to: updatedQuery.email,
        subject: 'Response to your Query',
        html: `
          <h3>Hello ${updatedQuery.name},</h3>
          <p>We have an update regarding your query:</p>
          <blockquote style="background:#f9f9f9; padding:10px; border-left:4px solid #736DA8;">
            ${adminResponse}
          </blockquote>
          <p>Best Regards,<br/>Support Team</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${updatedQuery.email}`);
      } catch (emailError) {
        console.error("❌ Email failed:", emailError);
      }
    }

    res.status(200).json(updatedQuery);
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

// 4. NEW: Delete Query
export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuery = await Query.findByIdAndDelete(id);

    if (!deletedQuery) {
      return res.status(404).json({ error: "Query not found" });
    }

    res.status(200).json({ message: "Query deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed", details: error.message });
  }
};