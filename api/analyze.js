api/analyse.js
// /api/analyze.js
// Vercel Serverless Function for Legal Document Analysis using Google Gemini AI

import { GoogleGenerativeAI } from '@google/generative-ai';
import multiparty from 'multiparty';
import fs from 'fs';

/**
 * Convert a file buffer to a format suitable for Gemini AI input
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {Object} Part object for generative AI
 */
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

/**
 * Parse multipart/form-data requests
 * @param {Request} req - Incoming request
 * @returns {Promise<Object>} - Parsed fields and files
 */
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
        part.on('data', (chunk) => chunks.push(chunk));
        part.on('end', () => {
          files[part.name] = {
            buffer: Buffer.concat(chunks),
            filename: part.filename,
            mimetype: part.headers['content-type'],
          };
        });
      }
    });

    form.on('close', () => resolve({ fields, files }));
    form.on('error', (err) => reject(err));
    form.parse(req);
  });
}

export default async function handler(req, res) {
  console.log('Function invoked with method:', req.method);

  // ---------------------------
  // CORS Headers
  // ---------------------------
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ---------------------------
    // Check API Key
    // ---------------------------
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in environment',
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    let documentText, documentFile;

    // ---------------------------
    // Parse request body
    // ---------------------------
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      const { fields, files } = await parseForm(req);
      documentText = fields.documentText;
      documentFile = files.documentFile;
    } else {
      documentText = req.body?.documentText;
    }

    if (!documentText && !documentFile) {
      return res.status(400).json({ error: 'No input provided' });
    }

    // ---------------------------
    // Prepare AI prompt
    // ---------------------------
    const instructionText = {
      text: `You are a specialized legal document analyzer. Analyze the provided document meticulously.
Respond ONLY with a valid JSON object with three keys: "summary", "keyClauses", and "relevantLaws".
- "summary": Provide a concise, professional summary of the document's purpose and key terms.
- "keyClauses": Identify and list the most critical clauses.
- "relevantLaws": List any applicable laws or legal statutes mentioned or implied.

Do not include any text, markdown, or formatting outside of the JSON object.`,
    };

    const promptParts = [];

    if (documentFile) {
      const filePart = fileToGenerativePart(documentFile.buffer, documentFile.mimetype);
      promptParts.push(filePart, instructionText);
    } else {
      promptParts.push({ text: documentText }, instructionText);
    }

    // ---------------------------
    // Send request to Gemini AI
    // ---------------------------
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent({ contents: [{ parts: promptParts }] });
    const response = await result.response;
    const rawText = response.text();

    // Extract JSON object from AI output
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({
        error: 'AI response was not valid JSON',
        details: rawText,
      });
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);
    res.json(jsonResponse);

  } catch (error) {
    console.error('Error during analysis:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
