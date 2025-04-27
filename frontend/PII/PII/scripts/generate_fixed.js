document.addEventListener('DOMContentLoaded', () => {
    // Initialize logger
    Logger.info('Generate Token page loaded');
    
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
            if (!input.value.trim()) {
                isValid = false;
                emptyFields.push(input.placeholder || input.name || 'Unknown field');
            }
        });
        
        generateTokenButton.disabled = !isValid;
        
        if (isValid) {
            Logger.debug('Form is valid, generate button enabled');
        } else {
            Logger.debug(`Form is invalid, missing fields: ${emptyFields.join(', ')}`);
        }
    }

    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            checkFormValidity();
        });
    });

    // Initial check for form validity
    checkFormValidity();

    // Event listener for the generate button
    generateTokenButton.addEventListener('click', async () => {
        console.log('Generate token button clicked');
        Logger.info('Generate token button clicked');
        
        // Get form values
        const formData = {};
        formInputs.forEach(input => {
            if (input.type === 'select-one') {
                formData.id_type = input.value;
            } else if (input.placeholder === 'Enter ID Number') {
                formData.id_number = input.value;
            } else if (input.placeholder === 'Name') {
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
        
        console.log('Form data collected:', formData);
        
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
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
        
        const loadingText = document.createElement('p');
        loadingText.textContent = 'Generating token...';
        loadingText.style.color = 'white';
        loadingText.style.marginTop = '1rem';
        
        loadingOverlay.appendChild(loadingText);
        document.body.appendChild(loadingOverlay);
        
        try {
            console.log('Making API call to:', `${API_URL}/encrypt`);
            
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
                })
            });
            
            console.log('API response status:', response.status);
            
            const data = await response.json();
            console.log('API response data:', data);
            
            if (response.ok) {
                // Display success message with token
                resultContainer.innerHTML = `
                    <h3 style="color: #00ff88; margin-bottom: 1rem;">Token Generated Successfully!</h3>
                    <div style="background: rgba(0, 114, 255, 0.1); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(0, 195, 255, 0.3); margin-bottom: 1rem;">
                        <p style="margin-bottom: 0.5rem;"><strong>Your Token:</strong></p>
                        <div style="font-family: 'Courier New', monospace; font-size: 1.2rem; background: rgba(16, 24, 39, 0.8); color: #00ff88; padding: 0.8rem; border-radius: 0.5rem; text-align: center; letter-spacing: 1px; border: 1px solid rgba(0, 195, 255, 0.5);">
                            ${data.token}
                        </div>
                    </div>
                    <p style="color: rgba(255, 255, 255, 0.7);"><small>Keep this token safe. You'll need it for verification.</small></p>
                `;
            } else {
                // Display error message
                resultContainer.innerHTML = `
                    <h3 style="color: #ff3b5c; margin-bottom: 1rem;">Error</h3>
                    <p>${data.error || 'Failed to generate token. Please try again.'}</p>
                `;
            }
        } catch (error) {
            console.error('API call error:', error);
            
            // Display error message
            resultContainer.innerHTML = `
                <h3 style="color: #ff3b5c; margin-bottom: 1rem;">Connection Error</h3>
                <p>Failed to connect to the server. Please check your internet connection and try again.</p>
            `;
        } finally {
            // Show the result container
            resultContainer.style.display = 'block';
            console.log('Result container displayed');
            
            // Remove the loading overlay
            document.body.removeChild(loadingOverlay);
        }
    });
});