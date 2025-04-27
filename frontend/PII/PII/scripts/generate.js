document.addEventListener('DOMContentLoaded', () => {
    // Initialize logger
    Logger.info('Generate Token page loaded');
    
    // Debug mode - add to window for console access
    window.debugPII = {
        forceEnableButton: function() {
            const btn = document.getElementById('generate-token');
            if (btn) {
                btn.disabled = false;
                btn.classList.add('active');
                btn.style.opacity = '1';
                console.log('Button forcibly enabled via debug function');
                return 'Button enabled';
            }
            return 'Button not found';
        },
        checkFormState: function() {
            const form = document.getElementById('generateForm');
            const inputs = form ? form.querySelectorAll('input, select') : [];
            const values = {};
            inputs.forEach(input => {
                values[input.placeholder || input.name || 'unknown'] = input.value;
            });
            console.log('Form values:', values);
            return values;
        }
    };
    
    console.log('Debug mode enabled. Use window.debugPII.forceEnableButton() to enable the button if needed.');
    
    const generateTokenButton = document.getElementById('generate-token');
    const generateForm = document.getElementById('generateForm');
    
    // Create result container for displaying the token
    const resultContainer = document.createElement('div');
    resultContainer.classList.add('result-container');
    resultContainer.style.display = 'none';
    resultContainer.style.marginTop = '1.5rem';
    resultContainer.style.padding = '1.5rem';
    resultContainer.style.backgroundColor = 'rgba(0, 114, 255, 0.1)';
    resultContainer.style.borderRadius = '0.75rem';
    resultContainer.style.border = '1px solid rgba(0, 195, 255, 0.3)';
    resultContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    
    // Insert result container into the DOM
    generateForm.appendChild(resultContainer);
    Logger.debug('Result container added to form');

    // Backend API URL
    const API_URL = 'http://127.0.0.1:5000';
    Logger.debug(`API URL set to: ${API_URL}`);

    // Enable the generate button when all fields are filled
    const formInputs = generateForm.querySelectorAll('input, select');
    Logger.debug(`Found ${formInputs.length} form inputs`);
    
    function checkFormValidity() {
        let isValid = true;
        let emptyFields = [];
        
        formInputs.forEach(input => {
            // Check if the input is empty
            if (!input.value.trim()) {
                isValid = false;
                emptyFields.push(input.placeholder || input.name || 'Unknown field');
            }
            
            // Additional validation for email
            if (input.type === 'email' && input.value.trim() && !validateEmail(input.value)) {
                isValid = false;
                emptyFields.push('Valid Email');
            }
            
            // Additional validation for phone
            if (input.placeholder === 'Phone Number' && input.value.trim() && !validatePhone(input.value)) {
                isValid = false;
                emptyFields.push('Valid Phone Number');
            }
        });
        
        // Update button state
        generateTokenButton.disabled = !isValid;
        
        // Update button appearance
        if (isValid) {
            generateTokenButton.classList.add('active');
            generateTokenButton.style.opacity = '1';
            Logger.debug('Form is valid, generate button enabled');
        } else {
            generateTokenButton.classList.remove('active');
            generateTokenButton.style.opacity = '0.6';
            Logger.debug(`Form is invalid, missing or invalid fields: ${emptyFields.join(', ')}`);
        }
    }
    
    // Helper validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        // Simple validation - adjust as needed for your requirements
        return phone.length >= 10 && /^\d+$/.test(phone);
    }

    // Add event listeners to all form inputs
    formInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            Logger.debug(`Input changed: ${e.target.placeholder || e.target.name || 'Unknown field'}`);
            checkFormValidity();
        });
        
        // Also check on change event for select elements
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', () => {
                checkFormValidity();
            });
        }
    });
    
    // Initial check for form validity
    checkFormValidity();

    // Event listener for the generate button
    if (generateTokenButton) {
        console.log('Generate button found, adding event listener');
        
        // Add a direct click handler to the button
        generateTokenButton.onclick = async function() {
            console.log('Generate token button clicked via onclick');
            Logger.info('Generate token button clicked via onclick');
            
            // Force enable the button if it's still disabled
            if (generateTokenButton.disabled) {
                console.log('Button was disabled, enabling it');
                generateTokenButton.disabled = false;
            }
            
            // Continue with token generation...
        };
        
        // Also add the regular event listener
        generateTokenButton.addEventListener('click', async () => {
            console.log('Generate token button clicked via addEventListener');
            Logger.info('Generate token button clicked via addEventListener');
            
            // Get form values - collect all PII data
            const formData = {};
            formInputs.forEach(input => {
                if (input.type === 'select-one') {
                    formData.id_type = input.value;
                } else if (input.placeholder === 'Enter ID Number') {
                    formData.id_number = input.value;
                } else if (input.placeholder === 'Name') {
                    // Store both the name and user_id
                    formData.name = input.value;
                    formData.user_id = input.value.toLowerCase().replace(/\s+/g, '_');
                } else if (input.placeholder === 'Email ID') {
                    formData.email = input.value;
                } else if (input.placeholder === 'Date of Birth') {
                    formData.dob = input.value;
                } else if (input.placeholder === 'Phone Number') {
                    formData.phone = input.value;
                }
            });
            
            Logger.debug('Form data collected', { 
                user_id: formData.user_id,
                name: formData.name,
                email: formData.email ? '✓' : '✗',
                dob: formData.dob ? '✓' : '✗',
                phone: formData.phone ? '✓' : '✗',
                id_type: formData.id_type,
                // Don't log the full ID number for security
                id_number_length: formData.id_number ? formData.id_number.length : 0
            });
            
            // Debug: Check if all required fields are present
            console.log('Form data:', formData);
            
            // Check if any required fields are missing
            const requiredFields = ['user_id', 'name', 'email', 'dob', 'phone', 'id_type', 'id_number'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                alert('Please fill in all required fields: ' + missingFields.join(', '));
                return;
            }
            
            // Log user action
            Logger.logUserAction('generate_token_attempt', {
                user_id: formData.user_id,
                id_type: formData.id_type
            });

            // Create loading overlay with progress indicator
            Logger.debug('Creating loading overlay');
            const loadingOverlay = document.createElement('div');
            loadingOverlay.classList.add('loading-overlay');
            loadingOverlay.style.position = 'fixed';
            loadingOverlay.style.top = '0';
            loadingOverlay.style.left = '0';
            loadingOverlay.style.width = '100%';
            loadingOverlay.style.height = '100%';
            loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            loadingOverlay.style.display = 'flex';
            loadingOverlay.style.flexDirection = 'column';
            loadingOverlay.style.justifyContent = 'center';
            loadingOverlay.style.alignItems = 'center';
            loadingOverlay.style.zIndex = '1000';
            
            const spinner = document.createElement('div');
            spinner.classList.add('spinner');
            spinner.style.border = '4px solid rgba(255, 255, 255, 0.3)';
            spinner.style.borderTop = '4px solid #ffffff';
            spinner.style.borderRadius = '50%';
            spinner.style.width = '40px';
            spinner.style.height = '40px';
            spinner.style.animation = 'spin 1s linear infinite';
            
            const loadingText = document.createElement('p');
            loadingText.textContent = 'Generating token...';
            loadingText.style.color = 'white';
            loadingText.style.marginTop = '1rem';
            loadingText.style.fontSize = '1.2rem';
            
            // Add a progress indicator
            const progressContainer = document.createElement('div');
            progressContainer.style.width = '250px';
            progressContainer.style.height = '8px';
            progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            progressContainer.style.borderRadius = '4px';
            progressContainer.style.marginTop = '1rem';
            progressContainer.style.overflow = 'hidden';
            
            const progressBar = document.createElement('div');
            progressBar.style.width = '0%';
            progressBar.style.height = '100%';
            progressBar.style.backgroundColor = '#2dd4bf';
            progressBar.style.transition = 'width 0.3s ease-in-out';
            
            progressContainer.appendChild(progressBar);
            
            // Add a status message
            const statusMessage = document.createElement('p');
            statusMessage.style.color = 'rgba(255, 255, 255, 0.7)';
            statusMessage.style.fontSize = '0.9rem';
            statusMessage.style.marginTop = '0.5rem';
            statusMessage.textContent = 'Initializing...';
            
            // Add keyframes for spinner animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            loadingOverlay.appendChild(spinner);
            loadingOverlay.appendChild(loadingText);
            loadingOverlay.appendChild(progressContainer);
            loadingOverlay.appendChild(statusMessage);
            document.body.appendChild(loadingOverlay);
            
            // Animate the progress bar
            let progress = 0;
            const progressInterval = setInterval(() => {
                // Slowly increase progress, but never reach 100%
                if (progress < 90) {
                    progress += (90 - progress) / 10;
                    progressBar.style.width = `${progress}%`;
                    
                    // Update status message based on progress
                    if (progress < 30) {
                        statusMessage.textContent = 'Generating secure token...';
                    } else if (progress < 60) {
                        statusMessage.textContent = 'Encrypting your data...';
                    } else if (progress < 80) {
                        statusMessage.textContent = 'Storing on blockchain...';
                    } else {
                        statusMessage.textContent = 'Almost done...';
                    }
                }
            }, 300);
            
            const startTime = performance.now();
            
            try {
                Logger.debug('Making API call to /encrypt endpoint');
                
                // Update loading message to show progress
                let dots = 0;
                const loadingInterval = setInterval(() => {
                    dots = (dots + 1) % 4;
                    loadingText.textContent = `Generating token${'.'.repeat(dots)}`;
                }, 500);
                
                // Make API call to backend with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                
                try {
                    const response = await fetch(`${API_URL}/encrypt`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            user_id: formData.user_id,
                            name: formData.name,
                            email: formData.email,
                            dob: formData.dob,
                            phone: formData.phone,
                            id_type: formData.id_type,
                            id_number: formData.id_number
                        }),
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    clearInterval(loadingInterval);
                
                
                const data = await response.json();
                const endTime = performance.now();
                const requestTime = (endTime - startTime) / 1000;
                
                Logger.debug(`API call completed in ${requestTime.toFixed(2)} seconds`);
                
                if (response.ok) {
                    // Complete the progress animation
                    clearInterval(progressInterval);
                    progressBar.style.width = '100%';
                    statusMessage.textContent = 'Token generated successfully!';
                    
                    Logger.info('Token generated successfully', { 
                        token: data.token,
                        file_url: data.file_url,
                        response_time: requestTime.toFixed(2)
                    });
                    
                    // Log user action
                    Logger.logUserAction('token_generated', {
                        user_id: formData.user_id,
                        token: data.token
                    });
                    
                    // Short delay to show the completed progress
                    setTimeout(() => {
                        // Display success message with token in blockchain style
                        resultContainer.innerHTML = `
                            <h3 style="color: #00ff88; margin-bottom: 1rem; font-size: 1.4rem;">Token Generated Successfully!</h3>
                            <div style="background: rgba(0, 114, 255, 0.1); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(0, 195, 255, 0.3); margin-bottom: 1rem;">
                                <p style="margin-bottom: 0.5rem;"><strong>Your Token:</strong></p>
                                <div style="font-family: 'Courier New', monospace; font-size: 1.4rem; background: rgba(16, 24, 39, 0.8); color: #00ff88; padding: 0.8rem; border-radius: 0.5rem; text-align: center; letter-spacing: 1px; border: 1px solid rgba(0, 195, 255, 0.5);">
                                    ${data.token}
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; margin-top: 1rem;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #00c3ff; margin-right: 0.5rem;">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 8v4l2 2"></path>
                                </svg>
                                <p style="color: rgba(255, 255, 255, 0.7);"><small>Keep this token safe. You'll need it for verification. This token is securely stored on the blockchain.</small></p>
                            </div>
                        `;
                        resultContainer.style.display = 'block';
                        
                        // Store token in localStorage for demo purposes
                        localStorage.setItem('authToken', data.token);
                        
                        // Reset form
                        generateForm.reset();
                        generateTokenButton.disabled = true;
                        
                        // Remove loading overlay
                        loadingOverlay.remove();
                        Logger.debug('Loading overlay removed');
                    }, 500);
                    
                    // Return early to prevent the finally block from removing the overlay
                    return;
                } else {
                    // Stop the progress animation
                    clearInterval(progressInterval);
                    
                    Logger.error('Failed to generate token', { 
                        error: data.error,
                        response_time: requestTime.toFixed(2)
                    });
                    
                    // Log user action
                    Logger.logUserAction('token_generation_failed', {
                        user_id: formData.user_id,
                        error: data.error
                    });
                    
                    // Display error message
                    resultContainer.innerHTML = `
                        <h3 style="color: #ff3b5c; margin-bottom: 1rem; font-size: 1.4rem;">Error</h3>
                        <div style="background: rgba(255, 59, 92, 0.1); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(255, 59, 92, 0.3);">
                            <p>${data.error || 'Failed to generate token. Please try again.'}</p>
                        </div>
                        <div style="display: flex; align-items: center; margin-top: 1rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ff3b5c; margin-right: 0.5rem;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p style="color: rgba(255, 255, 255, 0.7);"><small>Please try again or contact support if the problem persists.</small></p>
                        </div>
                    `;
                    resultContainer.style.display = 'block';
                }
            } catch (error) {
                clearTimeout(timeoutId);
                clearInterval(loadingInterval);
                clearInterval(progressInterval);
                
                // Show error in progress bar
                progressBar.style.width = '100%';
                progressBar.style.backgroundColor = '#ec4899';
                statusMessage.textContent = 'Error occurred';
                
                let errorMessage = 'Failed to connect to the server. Please try again later.';
                
                if (error.name === 'AbortError') {
                    errorMessage = 'The request took too long to complete. This might be due to network issues or high server load.';
                    Logger.error('Request timeout', { error: error.message });
                    
                    // Log user action
                    Logger.logUserAction('request_timeout', {
                        user_id: formData.user_id
                    });
                } else {
                    Logger.error('Connection request error', { error: error.message });
                    
                    // Log user action
                    Logger.logUserAction('connection_error', {
                        user_id: formData.user_id,
                        error: error.message
                    });
                }
                
                resultContainer.innerHTML = `
                    <h3 style="color: #ff3b5c; margin-bottom: 1rem; font-size: 1.4rem;">Connection Error</h3>
                    <div style="background: rgba(255, 59, 92, 0.1); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(255, 59, 92, 0.3);">
                        <p>${errorMessage}</p>
                    </div>
                    <div style="display: flex; align-items: center; margin-top: 1rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ff3b5c; margin-right: 0.5rem;">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <p style="color: rgba(255, 255, 255, 0.7);"><small>Please check your internet connection and try again. If the problem persists, the blockchain network might be experiencing issues.</small></p>
                    </div>
                `;
                resultContainer.style.display = 'block';
                
                // Add a small delay before removing the overlay
                setTimeout(() => {
                    loadingOverlay.remove();
                    Logger.debug('Loading overlay removed after error');
                }, 1000);
            } finally {
                // For success case, we've already handled the overlay removal
                // For error case, we've added a delay before removing
                // This is just a fallback in case something goes wrong
                setTimeout(() => {
                    if (document.body.contains(loadingOverlay)) {
                        loadingOverlay.remove();
                        Logger.debug('Loading overlay removed in finally block');
                    }
                }, 1500);
            }
        });
    }
});