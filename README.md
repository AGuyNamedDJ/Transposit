# Transposit

## Description <a name="description"></a>

Transposit is an advanced system designed to automate the distribution of incoming deposits into various financial accounts based on predefined percentages. This ensures efficient, accurate, and timely allocation of funds according to user-specified distribution rules.

## Table of Contents <a name="table-of-contents"></a>

1. [Description](#description)
2. [Installation](#installation)
3. [Usage](#usage)
4. [File & Directory Structure](#file--directory-structure)
   - [ai/](#ai)
   - [api/](#api)
   - [db/](#db)
5. [APIs & Libraries Used](#api-libraries)
6. [Testing](#testing)
7. [Credits](#credits)
8. [Contact Information](#contact-information)

---

## Installation <a name="installation"></a>

To install and set up the Transposit system, follow these steps:

1. **Clone the repository**:

   ```sh
   git clone https://github.com/your-username/transposit.git
   cd transposit

   ```

2. **Install dependencies**:

   ```sh
   npm install
   ```

3. **Set up environment variables**:
   Create a .env file in the root directory and add your configuration settings as shown below:

   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

4. **Start the development server**:

   ```sh
   npm run dev
   ```

---

## Usage <a name="usage"></a>

After successfully running the server, navigate to localhost:3000 (or the port indicated in your terminal) in your browser. You should see the landing page for the Transposit system.

### Key Features:

    1. User Management: Handle user registration, authentication, and authorization.
    2. Account Management: Manage financial accounts where deposits will be distributed.
    3. Transaction Handling: Process incoming deposits and distribute them based on predefined rules.
    4. Distribution Rules: Define and manage the rules for how incoming deposits should be distributed.

---

## File & Directory Structure <a name="file--directory-structure"></a>

The Transposit project is organized as follows:

### ai/

Contains the AI models and related utilities.

    • ai/: Placeholder for any future AI models and related utilities.

### api/

Contains the API endpoint definitions and logic.

    • test/: Directory for API endpoint tests.
    • accounts.js: Handles API requests related to account management.
    • distributionRules.js: Manages API requests related to distribution rules.
    • incomingDeposits.js: Processes incoming deposit data.
    • index.js: Entry point for the API routes.
    • transactions.js: Manages transaction-related API requests.
    • users.js: Handles user-related API requests.
    • utils.js: Utility functions used across API endpoints.

### db/

Contains the database models and helper functions.

    • accounts.js: Model for managing financial accounts.
    • distributionRules.js: Model for managing distribution rules.
    • incomingDeposits.js: Model for handling incoming deposits.
    • index.js: Entry point for database connections and model aggregation.
    • seed.js: Script for seeding the database.
    • transactions.js: Model for managing transactions.
    • users.js: Model for managing user information.

### Root Directory

    • .env: Contains environment variables for configuration.
    • .gitignore: Specifies files and directories to be ignored by Git.
    • package-lock.json: Contains the exact versions of dependencies installed.
    • package.json: Lists project dependencies and scripts.
    • README.md: The main documentation file for the project.
    • SDLC.md: Documentation of the software development life cycle.
    • server.js: Entry point for starting the server.

---

## APIs & Libraries Used <a name="api-libraries"></a>

### Libraries:

    1. bcrypt: A library for hashing passwords securely.
    2. cors: Middleware to enable Cross-Origin Resource Sharing.
    3. dotenv: A module to manage environment variables.
    4. express: A web framework for Node.js to build APIs and web applications.
    5. jsonwebtoken: A library to handle JSON Web Tokens for authentication.
    6. morgan: An HTTP request logger middleware.
    7. pg: A PostgreSQL client for Node.js.

### APIs:

Transposit provides a comprehensive set of RESTful APIs to manage the distribution of incoming deposits. Here’s an overview of the key functionalities provided by the APIs:

#### Authentication and User Management

Transposit includes secure user authentication and authorization using JSON Web Tokens (JWT). It ensures that only authorized personnel can access sensitive data.

    • Register User: POST /api/users/register - Registers a new user with the system.
    • Login User: POST /api/users/login - Authenticates a user and issues a JWT.

#### Account Management

Efficiently manage financial accounts where deposits will be distributed.

    • Create Account: POST /api/accounts - Adds a new financial account.
    • Retrieve Account: GET /api/accounts/:id - Retrieves details of a specific account.
    • Update Account: PUT /api/accounts/:id - Updates account information.
    • Delete Account: DELETE /api/accounts/:id - Deletes an account.

#### Distribution Rules

Define and manage the rules for how incoming deposits should be distributed.

    • Create Rule: POST /api/distributionRules - Adds a new distribution rule.
    • Retrieve Rule: GET /api/distributionRules/:id - Retrieves details of a specific rule.
    • Update Rule: PUT /api/distributionRules/:id - Updates a distribution rule.
    • Delete Rule: DELETE /api/distributionRules/:id - Deletes a distribution rule.

#### Incoming Deposits

Process incoming deposits and distribute them according to predefined rules.

    • Create Deposit: POST /api/incomingDeposits - Records a new incoming deposit.
    • Retrieve Deposit: GET /api/incomingDeposits/:id - Retrieves details of a specific deposit.
    • Update Deposit: PUT /api/incomingDeposits/:id - Updates deposit information.
    • Delete Deposit: DELETE /api/incomingDeposits/:id - Deletes a deposit record.

#### Transactions

Manage transaction records.

    • Create Transaction: POST /api/transactions - Records a new transaction.
    • Retrieve Transaction: GET /api/transactions/:id - Retrieves details of a specific transaction.
    • Update Transaction: PUT /api/transactions/:id - Updates transaction information.
    • Delete Transaction: DELETE /api/transactions/:id - Deletes a transaction record.

#### Example Usage

To get a feel for how to interact with the Transposit APIs, here’s an example of how to create a new user:
`sh
    curl -X POST http://localhost:3000/api/users/register -H "Content-Type: application/json" -d '{
    "username": "johndoe",
    "password": "securepassword",
    "email": "john.doe@example.com"
    }'
    `

This request will create a new user in the system. Similar requests can be made for other endpoints to manage accounts, distribution rules, deposits, and transactions.

---

## Testing <a name="testing"></a>

Testing is a crucial part of the development process to ensure the reliability and functionality of the Transposit system. Manual testing was conducted through extensive logging and step-by-step verification of each functionality.

### Testing Approach

    1. Logging: Throughout the codebase, console.log statements were used to trace the execution flow and validate the data at various stages of processing.
    2. Endpoint Verification: Each API endpoint was manually tested using tools like Postman to ensure they work as expected. This included verifying the responses for different request types (GET, POST, PUT, DELETE).
    3. Error Handling: Specific scenarios were tested to check how the system handles errors, such as invalid input data or unauthorized access attempts.
    4. Database Operations: Database operations (CRUD) were verified by directly querying the PostgreSQL database before and after API calls to ensure data consistency.

#### Example Testing Process

For example, to test the Create Account endpoint:

    1. Logging in Code: Add console.log statements in accounts.js to log the incoming request data and the response being sent back.

    ```js
    router.post('/', async (req, res) => {
        try {
            console.log('Creating new account with data:', req.body);
            const newAccount = await Account.create(req.body);
            console.log('New account created:', newAccount);
            res.status(201).json(newAccount);
        } catch (error) {
            console.error('Error creating account:', error);
            res.status(500).json({ error: 'Failed to create account' });
        }
    });
    ```
    2. **Manual Request with Postman**:
        - Open Postman and create a POST request to `http://localhost:3000/api/accounts`.
        - In the body of the request, include the account data in JSON format:

        ```json
        {
            "name": "Savings Account",
            "balance": 5000
        }
        ```

    3. **Verify Logs**:
        - Check the server logs to ensure the data was received and processed correctly.
        - Verify the logs show the expected data at each stage of the process.

    4. **Database Verification**:
        - Use a PostgreSQL client to query the relevant table and verify that the data has been updated or retrieved correctly.

By following this detailed manual testing process, you can ensure each part of the system works as intended and catch any issues early.

## Credits <a name="credits"></a>

Transposit was designed and developed by Dalron J. Robertson, showcasing his expertise in backend development and his commitment to creating efficient, secure, and scalable solutions for financial transaction management.

**Project Lead and Developer**: Dalron J. Robertson

## Contact Information <a name="contact-information"></a>

For any questions, feedback, or contributions, please contact:

- Email: dalronj.robertson@gmail.com
- Github: [AGuyNamedDJ](https://github.com/AGuyNamedDJ)
- LinkedIn: [Dalron J. Robertson](https://www.linkedin.com/in/dalronjrobertson/)
- Website: [dalronjrobertson.com](https://dalronjrobertson.com)
- YouTube: [AGNDJ](https://youtube.com/@AGNDJ)
