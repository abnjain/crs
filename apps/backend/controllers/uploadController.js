// backend/controllers/uploadController.js
import { parseExcelFile } from "../utils/excelParser.js";

export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert Excel/CSV into JSON
    const jsonData = await parseExcelFile(req.file.path);

    // You can later branch logic here:
    // if (req.body.type === "alumni") -> save to Alumni DB
    // if (req.body.type === "marks") -> save to Marks DB
    // if (req.body.type === "users") -> save to Users DB

    return res.status(200).json({
      message: "File uploaded successfully",
      data: jsonData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error processing file",
      error: error.message,
    });
  }
};
