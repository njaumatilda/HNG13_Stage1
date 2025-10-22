# HNG Stage 1 API

This is a RESTful API service to analyze and store string properties, supporting endpoints for creation, retrieval, filtering (including natural language queries), and deletion, with detailed response and error handling requirements.

## Features

- Provides 3 GET endpoints that:
  * retrieves a single string by its value
  * filters a string by natural language
  * retrieves all strings based on specific filters

- Provides a POST endpoint that creates and analyzes a string by:
  * returning the number of characters in the string
  * returning if the string reads the same forwards and backwards(is a palindrome)
  * returning the count of distinct characters in the string
  * returning the number of words separated by whitespace
  * returning the SHA-256 hash of the string for unique identification
  * returning the map each character to its occurrence count

- Provides a DELETE endpoint that deletes a single string by its value

- Returns responses in JSON format
- Handles CORS for cross-origin requests

## Tech Stack

- Node.js
- Express.js

## Local setup instructions

1. Clone the repository

```bash
git clone https://github.com/njaumatilda/HNG13_Stage1.git
```

2. Navigate to the project directory

```bash
cd HNG13_Stage1
```

3. Install dependencies

```bash
npm install
```

| The dependancies used in this task are: `dotenv`, `express`, `cors` and `mongoose` |

4. Configure environment variables

To run this project, you will need to create a `.env` file in the project directory and make sure it is included in the `.gitignore` file. Configure the following environment variables:

```env
PORT = your-port
DB_URL = your DB_URL
```

> Replace `your-port` with your specified port and `your DB_URL` with your specified DB_URL

5. Start the server

```bash
npm run dev
```

## API Documentation

Here is the reference on the usage of the API:
[API Documentation](https://documenter.getpostman.com/view/38132076/2sB3QQJTMG)

## Deployment

The API has been deployed to a publicly accessible endpoint on Railway:
[Live URL]()

## Author

[Matilda Njau](https://github.com/njaumatilda)
