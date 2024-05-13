// Import Client & Exports;
const { client } = require('./index');

// File Imports
const { createUser, getAllUsers, getUserById, getUserByUsername, updateUser, deleteUser } = require('./users');
const { createAccount, getAccountById, getAllAccountsByUserId, getAccountByAccountNumber, getAllAccountsByRoutingNumber, updateAccount, deleteAccount } = require('./accounts');


// Methods: dropTables
async function dropTables(){
    try {
        console.log("Dropping tables... ");
        await client.query(`
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS accounts CASCADE;
            DROP TABLE IF EXISTS transactions CASCADE;
            DROP TABLE IF EXISTS distribution_rules CASCADE;
            DROP TABLE IF EXISTS incoming_deposit CASCADE;
        `);
        console.log("Finished dropping tables.")
    } catch(error){
        console.log("Error dropping tables!")
        console.log(error)
    }
};

// Methods: createTables
async function createTables() {
    try {
        console.log('Starting to build tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                phone_number VARCHAR(15) UNIQUE,
                date_of_birth DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS accounts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                account_type VARCHAR(50),
                account_name VARCHAR(255),
                account_number VARCHAR(255) NOT NULL,
                routing_number VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                account_id INTEGER NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'pending',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS distribution_rules (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                account_id INTEGER NOT NULL,
                percentage DECIMAL(5, 2) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS incoming_deposits (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                source VARCHAR(255) NOT NULL,
                received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );            
        `);
        console.log('Finished building tables.');
    } catch (error) {
        console.error('Error building tables!');
        console.log(error);
    }
};

// Method: createInitialUsers
async function createInitialUsers() {
    console.log("Creating initial users...");
    try {
        await createUser({
            username: 'Owner1', 
            password: 'SecurePass123!', 
            email: 'user1@example.com', 
            first_name: 'Dalron', 
            last_name: 'Robertson', 
            phone_number: '601-456-7890',
            date_of_birth: '1980-01-01'
        });
    
        console.log("Finished creating initial user.");
    } catch (error) {
        console.error("Error creating initial user!");
        console.log(error);
    }
};

// Method: createInitialAccounts
async function createInitialAccounts() {
    try {
        console.log("Creating initial accounts...");

        // Sample account data
        await createAccount(1, {
            account_type: 'savings',
            account_name: 'Main Savings Account',
            account_number: '123456789012',
            routing_number: '110000000'
        });

        await createAccount(1, {  // Reusing the same user_id for multiple accounts
            account_type: 'checking',
            account_name: 'Everyday Expenses Account',
            account_number: '987654321098',
            routing_number: '110000001'
        });

        console.log("Initial accounts created successfully.");
    } catch (error) {
        console.error("Error creating initial accounts:", error);
    }
};

// Rebuild DB
async function rebuildDB() {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialAccounts();

    } catch (error) {
        console.log("Error during rebuildDB!")
        console.log(error.detail);
    }
};

// Test DB
async function testDB() {
    try {
        console.log("Starting to test database...");

    // // Test User.js Helper FNs
    //     console.log("Creating initial users...");
    //     const userData1 = {
    //         username: 'Owner1', 
    //         password: 'SecurePass123!', 
    //         email: 'user1@example.com', 
    //         first_name: 'Dalron', 
    //         last_name: 'Robertson', 
    //         phone_number: '601-456-7890',
    //         date_of_birth: '1980-01-01'
    //     };

    //     const user1 = await createUser(userData1);
    //     console.log("Created user", user1);

    //     // Test getAllUsers
    //     console.log("Calling getAllUsers...");
    //     const allUsers = await getAllUsers();
    //     console.log("All users", allUsers);

    //     // Assuming at least one user is created successfully
    //     if (allUsers.length > 0) {
    //         // Test getUserById
    //         console.log("Calling getUserById for the first user...");
    //         const userById = await getUserById(allUsers[0].id);
    //         console.log("User by ID", userById);

    //         // Test getUserByUsername
    //         console.log("Calling getUserByUsername for the first user...");
    //         const userByUsername = await getUserByUsername(allUsers[0].username);
    //         console.log("User by Username", userByUsername);

    //         // Test updateUser
    //         console.log("Updating first user's last name...");
    //         const updatedUser = await updateUser(allUsers[0].username, { last_name: 'UpdatedLastName' });
    //         console.log("Updated user", updatedUser);

    //         // Test deleteUser
    //         console.log("Deleting the first user...");
    //         const deletedUser = await deleteUser(allUsers[0].username);
    //         console.log("Deleted user", deletedUser);
    //     }

    // Test Accounts.js Helper FNs
        // Test retrieving all accounts for a user
        console.log("Calling getAllAccountsByUserId...");
        const userAccounts = await getAllAccountsByUserId(1);
        console.log("Retrieved accounts for user ID 1:", userAccounts);

        // Test getAccountById
        console.log("Calling getAccountById for the first account...");
        const accountById = await getAccountById(userAccounts[0].id);
        console.log("Account by ID:", accountById);

        // Test getAccountByAccountNumber
        console.log("Calling getAccountByAccountNumber...");
        const accountByNumber = await getAccountByAccountNumber(userAccounts[0].account_number);
        console.log("Account by Account Number:", accountByNumber);

        // Test getAllAccountsByRoutingNumber
        console.log("Calling getAllAccountsByRoutingNumber...");
        const accountsByRoutingNumber = await getAllAccountsByRoutingNumber(userAccounts[0].routing_number);
        console.log("Accounts by Routing Number:", accountsByRoutingNumber);

        // Test updating an account
        console.log("Calling updateAccount...");
        const updatedAccount = await updateAccount(userAccounts[0].id, {
            account_name: 'Updated Main Savings Account',
            account_number: '112233445566'
        });
        console.log("Updated account:", updatedAccount);

        // Test deleting an account
        console.log("Calling deleteAccount...");
        const deleteResult = await deleteAccount(userAccounts[1].id);
        console.log("Deleted account result:", deleteResult);
    



    } catch (error) {
        console.log("Error during testDB!");
        console.log(error);
    }
};

// Rebuild Call
rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end())