// Vercel serverless function for document analysis
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');

// Configure multer for serverless environment
const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage in serverless
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert file buffer to generative part
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// Middleware wrapper for multer in serverless
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Run multer middleware
    await runMiddleware(req, res, upload.single('documentFile'));

    const { documentText } = req.body;
    const documentFile = req.file;

    // Initialize the Gemini AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const promptParts = [];

    // Define the AI instruction prompt
    const instructionText = {
      text: `
      You are a specialized legal document analyzer. Analyze the provided document meticulously.
      Respond ONLY with a valid JSON object with three keys: "summary", "keyClauses", and "relevantLaws".
      - "summary": Provide a concise, professional summary of the document's purpose and key terms.
      - "keyClauses": Identify and list the most critical clauses.
      - "relevantLaws": List any applicable laws or legal statutes mentioned or implied.
      
      Do not include any text, markdown, or formatting outside of the JSON object.
    `};

    // Process file or text input
    if (documentFile) {
      // Convert the uploaded file buffer to base64 format for AI processing
      const filePart = fileToGenerativePart(documentFile.buffer, documentFile.mimetype);
      promptParts.push(filePart, instructionText);
    } else if (documentText) {
      // Add the text content and instructions to the prompt
      promptParts.push({ text: documentText }, instructionText);
    } else {
      return res.status(400).json({ error: "No document text or file provided." });
    }

    // Send the prompt to Google Gemini AI for analysis
    const result = await model.generateContent({ contents: [{ parts: promptParts }] });
    const response = await result.response;
    let rawText = response.text();
    
    // Use regex to find JSON object in the AI response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ 
        error: "AI response was not valid JSON.",
        details: rawText 
      });
    }

    const jsonString = jsonMatch[0];
    const jsonResponse = JSON.parse(jsonString);
    
    res.json(jsonResponse);

  } catch (error) {
    console.error("Error during analysis:", error);
    res.status(500).json({ 
      error: "An internal server error occurred.", 
      details: error.message 
    });
  }
}
