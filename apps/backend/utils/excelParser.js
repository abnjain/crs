// backend/utils/excelParser.js
import * as XLSX from "xlsx";
import fs from "fs";

export const parseExcelFile = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Clean up file after parsing
    fs.unlinkSync(filePath);

    return jsonData;
  } catch (err) {
    throw new Error("Failed to parse Excel file: " + err.message);
  }
};
