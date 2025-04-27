# Blockchain ID Authentication System

This project provides a secure way to authenticate personal identification information (PII) using blockchain technology.

## Features

- Generate secure tokens for PII data
- Store encrypted data on IPFS via Filebase
- Validate tokens using blockchain verification
- User-friendly web interface

## Prerequisites

- Python 3.8+
- Node.js and npm
- Web browser

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd PII-Authenticator/backend
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   ALCHEMY_API_KEY=your_alchemy_api_key
   PRIVATE_KEY=your_ethereum_private_key
   CONTRACT_ADDRESS=your_deployed_contract_address
   FILEBASE_ACCESS_KEY=your_filebase_access_key
   FILEBASE_SECRET_KEY=your_filebase_secret_key
   BUCKET_NAME=your_filebase_bucket_name
   ENCRYPTED_AES_KEY=your_base64_encoded_aes_key
   ```

### Running the Application

#### Option 1: Using the Batch File (Windows)

1. Simply run the `start_app.bat` file in the root directory:
   ```
   start_app.bat
   ```

#### Option 2: Manual Start

1. Start the backend server:
   ```
   cd PII-Authenticator/backend
   python app.py
   ```

2. Open the frontend in your browser:
   ```
   PII-Authenticator/frontend/PII/PII/index.html
   ```

## Usage

### Generating a Token

1. Navigate to the "Generate Token" page
2. Fill in all required fields
3. Click "Generate Token"
4. Save the generated token for future verification

### Validating a Token

1. Navigate to the "Validate Token" page
2. Enter the token you received
3. Click "Validate"
4. The system will verify the token on the blockchain

## Troubleshooting

- If you encounter CORS issues, make sure the backend server is running
- Check the console for any error messages
- Ensure all environment variables are properly set

## License

This project is licensed under the MIT License - see the LICENSE file for details.