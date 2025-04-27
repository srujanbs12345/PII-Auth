// Mock API for testing
class MockAPI {
    static init() {
        // Store generated tokens in localStorage for persistence
        if (!localStorage.getItem('mockTokens')) {
            localStorage.setItem('mockTokens', JSON.stringify([]));
        }
        
        // Add a method to manually add tokens for testing
        window.addMockToken = function(token) {
            const tokens = JSON.parse(localStorage.getItem('mockTokens') || '[]');
            if (!tokens.includes(token)) {
                tokens.push(token);
                localStorage.setItem('mockTokens', JSON.stringify(tokens));
                console.log(`Token ${token} added to mock storage`);
                return true;
            }
            console.log(`Token ${token} already exists in mock storage`);
            return false;
        };
        
        // Add a method to list all stored tokens
        window.listMockTokens = function() {
            const tokens = JSON.parse(localStorage.getItem('mockTokens') || '[]');
            console.log('Stored mock tokens:', tokens);
            return tokens;
        };
        
        // Override the fetch function to intercept API calls
        const originalFetch = window.fetch;
        
        window.fetch = function(url, options) {
            console.log('Mock API intercepted fetch call to:', url);
            
            // Check if this is a call to our API
            if (url.includes('/encrypt')) {
                return MockAPI.handleEncrypt(options);
            } else if (url.includes('/validate_token')) {
                return MockAPI.handleValidate(options);
            }
            
            // Pass through to the original fetch for other URLs
            return originalFetch(url, options);
        };
        
        console.log('Mock API initialized - all API calls will be intercepted');
    }
    
    static handleEncrypt(options) {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                // Parse the request body
                const body = JSON.parse(options.body);
                console.log('Mock API received encrypt request with data:', body);
                
                // Generate a mock token
                const token = 'MOCK_' + Math.random().toString(36).substring(2, 15);
                
                // Store the token in localStorage for validation
                const tokens = JSON.parse(localStorage.getItem('mockTokens') || '[]');
                tokens.push(token);
                localStorage.setItem('mockTokens', JSON.stringify(tokens));
                console.log(`Token ${token} stored in mock storage`);
                
                // Create a mock response
                const mockResponse = {
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({
                        token: token,
                        file_url: `https://filebase.example.com/${token}.json`
                    })
                };
                
                resolve(mockResponse);
            }, 1500); // 1.5 second delay
        });
    }
    
    static handleValidate(options) {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                // Parse the request body
                const body = JSON.parse(options.body);
                const token = body.token;
                console.log('Mock API received validate request with token:', token);
                
                // Check if this token exists in our mock storage
                const tokens = JSON.parse(localStorage.getItem('mockTokens') || '[]');
                const isValid = tokens.includes(token);
                
                console.log(`Token ${token} is ${isValid ? 'valid' : 'invalid'}`);
                
                // Create a mock response
                const mockResponse = {
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({
                        valid: isValid
                    })
                };
                
                resolve(mockResponse);
            }, 1000); // 1 second delay
        });
    }
}

// Initialize the mock API
MockAPI.init();