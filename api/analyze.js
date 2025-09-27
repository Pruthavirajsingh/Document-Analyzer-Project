// Vercel serverless function for document analysis
import { GoogleGenerativeAI } from '@google/generative-ai';
import multiparty from 'multiparty';

// Helper function to convert file buffer to generative part
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// Parse multipart form data
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    const fields = {};
    const files = {};

    form.on('field', (name, value) => {
      fields[name] = value;
    });

    form.on('part', (part) => {
      if (part.filename) {
        const chunks = [];
        part.on('data', (chunk) => {
          chunks.push(chunk);
        });
        part.on('end', () => {
          files[part.name] = {
            buffer: Buffer.concat(chunks),
            filename: part.filename,
            mimetype: part.headers['content-type']
          };
        });
      }
    });

    form.on('close', () => {
      resolve({ fields, files });
    });

    form.on('error', (err) => {
      reject(err);
    });

    form.parse(req);
  });
}

export default async function handler(req, res) {
  console.log('Function invoked with method:', req.method);
  console.log('Environment check - API key exists:', !!process.env.GEMINI_API_KEY);

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
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting POST request processing');
    
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error('API key not found in environment');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('API key found, initializing Gemini AI');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    let documentText, documentFile;

    // Parse form data
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      console.log('Parsing multipart form data');
      const { fields, files } = await parseForm(req);
      documentText = fields.documentText;
      documentFile = files.documentFile;
    } else {
      console.log('Parsing JSON body');
      documentText = req.body?.documentText;
    }

    console.log('Document text provided:', !!documentText);
    console.log('Document file provided:', !!documentFile);

    // Initialize the Gemini AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const promptParts = [];

    // Define the AI instruction prompt
    const instructionText = {
      text: `You are a specialized legal document analyzer. Analyze the provided document meticulously.
Respond ONLY with a valid JSON object with three keys: "summary", "keyClauses", and "relevantLaws".
- "summary": Provide a concise, professional summary of the document's purpose and key terms.
- "keyClauses": Identify and list the most critical clauses.
- "relevantLaws": List any applicable laws or legal statutes mentioned or implied.

Do not include any text, markdown, or formatting outside of the JSON object.`
    };

    // Process file or text input
    if (documentFile) {
      console.log('Processing file:', documentFile.filename);
      const filePart = fileToGenerativePart(documentFile.buffer, documentFile.mimetype);
      promptParts.push(filePart, instructionText);
    } else if (documentText) {
      console.log('Processing text input, length:', documentText.length);
      promptParts.push({ text: documentText }, instructionText);
    } else {
      console.log('No input provided');
      return res.status(400).json({ error: "No document text or file provided." });
    }

    console.log('Sending request to Gemini AI');
    // Send the prompt to Google Gemini AI for analysis
    const result = await model.generateContent({ contents: [{ parts: promptParts }] });
    const response = await result.response;
    let rawText = response.text();
    
    console.log('Received response from Gemini AI');
    
    // Use regex to find JSON object in the AI response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('Invalid JSON response from AI:', rawText);
      return res.status(502).json({ 
        error: "AI response was not valid JSON.",
        details: rawText 
      });
    }

    const jsonString = jsonMatch[0];
    const jsonResponse = JSON.parse(jsonString);
    
    console.log('Successfully processed request');
    res.json(jsonResponse);

  } catch (error) {
    console.error("Detailed error during analysis:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: "An internal server error occurred.", 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
