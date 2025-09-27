export default function handler(req, res) {
  console.log('Test function called');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(200).json({
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    nodeVersion: process.version
  });
}
