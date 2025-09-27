# Document Analyzer 📄✨

A powerful AI-powered legal document analyzer that provides instant analysis, summaries, and insights for legal documents using Google's Gemini AI.

![Document Analyzer](https://img.shields.io/badge/AI-Powered-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

- **📄 Document Upload**: Support for PDF, PNG, JPG files
- **📝 Text Input**: Direct text paste functionality
- **🤖 AI Analysis**: Powered by Google Gemini AI
- **📊 Smart Summaries**: Get concise document summaries
- **⚖️ Legal Insights**: Identify key clauses and relevant laws
- **🔗 Share Function**: Easy URL sharing with clipboard integration
- **💫 Modern UI**: Clean, responsive design

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **AI**: Google Generative AI (Gemini)
- **File Upload**: Multer
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with modern design

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/document-analyzer.git
   cd document-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## 🎯 Usage

### Text Analysis
1. Select "Text Input" tab
2. Paste your legal document text
3. Click "Analyze Document"
4. View the AI-generated analysis

### File Upload
1. Select "Upload File" tab
2. Upload your PDF, PNG, or JPG file
3. Click "Analyze Document"
4. Get instant analysis results

## 📋 API Endpoints

### POST `/analyze`
Analyzes documents and returns structured legal insights.

**Request Body:**
- `documentText` (string): Text content to analyze
- `documentFile` (file): Document file to analyze

**Response:**
```json
{
  "summary": "Document summary...",
  "keyClauses": "Key clauses identified...",
  "relevantLaws": "Applicable laws..."
}
```

## 🏗️ Project Structure

```
document-analyzer/
├── public/
│   ├── analyzer.html    # Main HTML file
│   ├── script.js        # Frontend JavaScript
│   └── style.css        # Styling
├── server.js            # Express server
├── package.json         # Dependencies
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## 👥 Authors

Made with ❤️ by:
- **Pruthavirajsingh Rajput**
- **Gayatri Kale** 
- **Kaustubh Palod**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Issues

If you encounter any issues, please create an issue on GitHub with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 🔮 Future Enhancements

- [ ] Support for more file formats (DOCX, TXT)
- [ ] User authentication system
- [ ] Document history and saved analyses
- [ ] Advanced filtering and search
- [ ] Export analysis to PDF/Word
- [ ] Multi-language support

---

⭐ **Star this repository if you find it helpful!**
