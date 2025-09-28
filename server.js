// Load environment variables from .env file (like API keys)
require('dotenv').config();

// Import Express.js framework for creating web server
const express = require('express');

// Import Multer for handling file uploads
const multer = require('multer');

// Import Google Generative AI SDK for Gemini AI integration
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import CORS middleware to handle cross-origin requests
const cors = require('cors');

// Import Node.js file system module for file operations
const fs = require('fs');

// Import Node.js path module for handling file paths
const path = require('path');

// Create an Express application instance
const app = express();

// Define the port number where server will listen for requests (use environment port or default to 3000)
const port = process.env.PORT || 3000;

// ========== MIDDLEWARE CONFIGURATION ==========
// Enable Cross-Origin Resource Sharing (allows frontend to communicate with backend)
app.use(cors());

// Parse incoming JSON requests and make data available in req.body
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

// ========== ROUTE DEFINITIONS ==========
// Root route: When user visits http://localhost:3000/, serve the main HTML file
app.get('/', (req, res) => {
  // Send the analyzer.html file from the public directory
  res.sendFile(path.join(__dirname, 'public', 'analyzer.html'));
});

// ========== FILE UPLOAD CONFIGURATION ==========
// Configure Multer to handle file uploads and store them in 'uploads/' directory
const upload = multer({ dest: 'uploads/' });

// ========== GOOGLE GEMINI AI INITIALIZATION ==========
// Check if the API key exists in environment variables
if (!process.env.GEMINI_API_KEY) {
  // Stop the application if API key is missing
  throw new Error('GEMINI_API_KEY is not set in the .env file');
}

// Initialize Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ========== HELPER FUNCTIONS ==========
// Convert uploaded file to format required by Google Gemini AI
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      // Read the file from disk and convert to base64 encoding
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      // Include the file's MIME type (e.g., 'application/pdf', 'image/jpeg')
      mimeType
    },
  };
}

// ========== API ENDPOINTS ==========
// POST route for document analysis - accepts file uploads via 'documentFile' field
app.post('/analyze', upload.single('documentFile'), async (req, res) => {
  try {
    // Extract text content from request body (if user pasted text directly)
    const { documentText } = req.body;
    
    // Get uploaded file information (if user uploaded a file)
    const documentFile = req.file;

    // Initialize the Gemini AI model (using the fast 'flash' variant)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Array to hold the parts of our prompt (text + file data)
    const promptParts = [];

    // Define the AI instruction prompt that tells Gemini how to analyze documents
    const instructionText = {
      text: `
      You are a specialized legal document analyzer. Analyze the provided document meticulously.
      Respond ONLY with a valid JSON object with three keys: "summary", "keyClauses", and "relevantLaws".
      - "summary": Provide a concise, professional summary of the document's purpose and key terms.
      - "keyClauses": Identify and list the most critical clauses.
      - "relevantLaws": List any applicable laws or legal statutes mentioned or implied.
      
      Do not include any text, markdown, or formatting outside of the JSON object.
    `}; // Fixed: Added missing closing backtick

    // Check if user uploaded a file
    if (documentFile) {
      // Convert the uploaded file to base64 format for AI processing
      const filePart = fileToGenerativePart(documentFile.path, documentFile.mimetype);
      
      // Add both the file data and instructions to the prompt
      promptParts.push(filePart, instructionText);
      
      // Delete the temporary uploaded file after processing
      fs.unlinkSync(documentFile.path);
    } 
    // Check if user provided text directly (no file upload)
    else if (documentText) {
      // Add the text content and instructions to the prompt
      promptParts.push({ text: documentText }, instructionText);
    } 
    // If neither file nor text is provided, return error
    else {
      return res.status(400).json({ error: "No document text or file provided." });
    }

    // Send the prompt to Google Gemini AI for analysis
    const result = await model.generateContent({ contents: [{ parts: promptParts }] });
    
    // Get the response from the AI model
    const response = await result.response;
    
    // Extract the text content from the AI response
    let rawText = response.text();
    
    // Use regex to find JSON object in the AI response (removes any extra text)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    // If no valid JSON found in the response, return an error
    if (!jsonMatch) {
      return res.status(502).json({ 
        error: "AI response was not valid JSON.",
        details: rawText 
      });
    }
    
    // Extract the JSON string from the regex match
    const jsonString = jsonMatch[0];
    
    // Parse the JSON string into a JavaScript object
    const jsonResponse = JSON.parse(jsonString);
    
    // Send the parsed JSON response back to the client
    res.json(jsonResponse);

  } catch (error) {
    // Log the error to console for debugging purposes
    console.error("Error during analysis:", error);
    
    // Send error response to client with 500 status (Internal Server Error)
    res.status(500).json({ error: "An internal server error occurred.", details: error.message });
  }
});

// ========== SERVER STARTUP ==========
// Start the Express server and listen for incoming requests on the specified port
app.listen(port, () => {
  // Log a message when server successfully starts
  console.log(`Server running at http://localhost:${port}`);
});
