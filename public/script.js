// Wait for the DOM to be fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // ========== DOM ELEMENT REFERENCES ==========
    // Get all tab buttons for switching between text input and file upload
    const tabs = document.querySelectorAll('.tab-btn');
    
    // Get the text area element for direct text input
    const textArea = document.getElementById('text-area');
    
    // Get the hidden file input element for file uploads
    const fileInput = document.getElementById('file-input');
    
    // Get the clickable file upload placeholder area
    const fileUploadPlaceholder = document.getElementById('file-upload-placeholder');
    
    // Get the analyze button that triggers document analysis
    const analyzeBtn = document.getElementById('analyze-btn');
    
    // Get the share button for copying URL to clipboard
    const shareBtn = document.getElementById('share-btn');

    // Get paragraph elements where analysis results will be displayed
    const summaryElement = document.querySelector('#summary p');
    const clausesElement = document.querySelector('#clauses p');
    const lawsElement = document.querySelector('#laws p');
    
    // Get loading spinner element (shown during analysis)
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Get the container for all analysis results
    const analysisResults = document.getElementById('analysis-results');

    // ========== STATE VARIABLES ==========
    // Track which tab is currently active (text-input or pdf-upload)
    let activeTab = 'text-input';
    
    // Store the uploaded file when user selects one
    let uploadedFile = null;

    // ========== TAB SWITCHING FUNCTIONALITY ==========
    // Function to handle UI updates when switching between input tabs
    function switchInputView(tab) {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to the clicked tab
        tab.classList.add('active');
        
        // Update the active tab state from the tab's data attribute
        activeTab = tab.dataset.tab;

        // Show/hide appropriate input elements based on selected tab
        if (activeTab === 'text-input') {
            // Show text area, hide file upload area
            textArea.style.display = 'block';
            fileUploadPlaceholder.style.display = 'none';
        } else {
            // Hide text area, show file upload area
            textArea.style.display = 'none';
            // Use 'flex' display to center the upload content
            fileUploadPlaceholder.style.display = 'flex'; 
        }
    }

    // ========== EVENT LISTENERS ==========
    // Add click event listeners to all tab buttons
    tabs.forEach(tab => {
        // When a tab is clicked, switch to that input view
        tab.addEventListener('click', () => switchInputView(tab));
    });

    // ========== FILE UPLOAD FUNCTIONALITY ==========
    // Make the entire file upload placeholder clickable to trigger file selection
    fileUploadPlaceholder.addEventListener('click', () => fileInput.click());

    // Handle file selection when user chooses a file
    fileInput.addEventListener('change', () => {
        // Check if at least one file was selected
        if (fileInput.files.length > 0) {
            // Store the selected file in our state variable
            uploadedFile = fileInput.files[0];
            
            // Update the placeholder text to show the selected file name
            fileUploadPlaceholder.querySelector('p').innerHTML = `File selected: <span>${uploadedFile.name}</span>`;
        }
    });

    // ========== ANALYZE BUTTON FUNCTIONALITY ==========
    // Handle analyze button click to process document or text
    analyzeBtn.addEventListener('click', async () => {
        // Check which input method is currently active
        if (activeTab === 'text-input') {
            // Get text from the text area
            const text = textArea.value;
            
            // Validate that text is not empty (trim removes whitespace)
            if (!text.trim()) {
                alert('Please paste some text to analyze.');
                return; // Exit early if no text provided
            }
            
            // Call analysis function with text input (no file)
            await getAnalysis(text, null);
        } 
        // Check if a file has been uploaded
        else if (uploadedFile) {
            // Call analysis function with file input (no text)
            await getAnalysis(null, uploadedFile);
        } 
        // No valid input provided
        else {
            alert('Please select a file to analyze.');
        }
    });

    // ========== SHARE BUTTON FUNCTIONALITY ==========
    // Handle share button click to copy current page URL to clipboard
    shareBtn.addEventListener('click', async () => {
        try {
            // Get the current page URL from the browser's location object
            const currentUrl = window.location.href;
            
            // Use the modern Clipboard API to copy URL to user's clipboard
            await navigator.clipboard.writeText(currentUrl);
            
            // Provide visual feedback to user that copy was successful
            const originalText = shareBtn.textContent; // Store original button text
            shareBtn.textContent = 'Copied!'; // Change button text to show success
            shareBtn.style.backgroundColor = '#22c55e'; // Change to green color for success
            
            // Reset button appearance after 2 seconds (2000 milliseconds)
            setTimeout(() => {
                shareBtn.textContent = originalText; // Restore original button text
                shareBtn.style.backgroundColor = ''; // Reset to original background color
            }, 2000);
            
        } catch (error) {
            // Log error to console for debugging purposes
            console.error('Failed to copy URL:', error);
            
            // Fallback method for older browsers that don't support Clipboard API
            const url = window.location.href;
            prompt('Copy this URL to share:', url); // Show URL in a prompt dialog
            
            // Provide feedback even when using fallback method
            const originalText = shareBtn.textContent;
            shareBtn.textContent = 'Copy URL above'; // Instruct user to copy from prompt
            setTimeout(() => {
                shareBtn.textContent = originalText; // Reset button text after 2 seconds
            }, 2000);
        }
    });

    // ========== MAIN ANALYSIS FUNCTION ==========
    // Async function to send document/text to server for AI analysis
    async function getAnalysis(documentText, documentFile) {
        // Show loading spinner to indicate processing has started
        loadingSpinner.style.display = 'block';
        
        // Remove the data-loaded attribute to reset text colors to placeholder style
        analysisResults.removeAttribute('data-loaded');
        
        // Update UI to show analysis is in progress
        summaryElement.textContent = 'Analyzing...'; // Show loading message in summary section
        clausesElement.textContent = ''; // Clear clauses section
        lawsElement.textContent = ''; // Clear laws section
        
        // Add placeholder styling to all result elements
        summaryElement.classList.add('placeholder');
        clausesElement.classList.add('placeholder');
        lawsElement.classList.add('placeholder');

        // ========== PREPARE DATA FOR SERVER REQUEST ==========
        // Create FormData object to send both text and file data to server
        const formData = new FormData();
        
        // Add document text to form data if provided (text input method)
        if (documentText) {
            formData.append('documentText', documentText);
        }
        
        // Add document file to form data if provided (file upload method)
        if (documentFile) {
            formData.append('documentFile', documentFile);
        }

        // ========== SEND REQUEST TO SERVER ==========
        try {
            // Send POST request to analysis endpoint with form data
            const response = await fetch('http://localhost:3000/analyze', {
                method: 'POST', // Use POST method to send data
                body: formData, // Send the FormData containing text/file
            });

            // ========== HANDLE SERVER RESPONSE ==========
            // Check if the server response indicates an error
            if (!response.ok) {
                // Parse error details from server response
                const errorData = await response.json();
                // Throw error with server details or generic message
                throw new Error(errorData.details || `Server error: ${response.statusText}`);
            }

            // Parse successful response as JSON containing analysis results
            const analysis = await response.json();

            // ========== UPDATE UI WITH ANALYSIS RESULTS ==========
            // Update each section with analysis results, provide fallback text if empty
            summaryElement.textContent = analysis.summary || 'No summary provided.';
            clausesElement.textContent = analysis.keyClauses || 'No key clauses identified.';
            lawsElement.textContent = analysis.relevantLaws || 'No relevant laws found.';
            
            // Remove placeholder styling from all result elements
            summaryElement.classList.remove('placeholder');
            clausesElement.classList.remove('placeholder');
            lawsElement.classList.remove('placeholder');
            
            // Add data attribute to trigger CSS styling for loaded content
            analysisResults.setAttribute('data-loaded', 'true');

        } catch (error) {
            // ========== ERROR HANDLING ==========
            // Log error details to browser console for debugging
            console.error('Error:', error);
            
            // Display user-friendly error message in the summary section
            summaryElement.textContent = `An error occurred: ${error.message}. Please check the console for details.`;
            
            // Clear other sections when there's an error
            clausesElement.textContent = "";
            lawsElement.textContent = "";
        } finally {
            // ========== CLEANUP ==========
            // Always hide loading spinner when request completes (success or error)
            loadingSpinner.style.display = 'none';
        }
    }
});
