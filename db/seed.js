// Import Client & Exports;
const { client } = require('./index');

// File Imports
const { createUser, getAllUsers, getUserById, getUserByUsername, updateUser, deleteUser } = require('./users');
const { createAccount, getAccountById, getAllAccountsByUserId, getAccountByAccountNumber, getAllAccountsByRoutingNumber, updateAccount, deleteAccount } = require('./accounts');
const { createTransaction, getAllTransactions ,getTransactionById, getTransactionsByUserId, getTransactionsByAccountId, getTransactionsByAmount,getTransactionsByDate, getTransactionsByStatus, getTransactionsBeforeDate, getTransactionsAfterDate, getTransactionsBetweenDates } = require('./transactions');
const { createDistributionRule, getRuleById, getRulesByUserId, updateRule,deleteRule } = require ('./distributionRules');
const { createIncomingFund, getIncomingFundById, getIncomingFundsByUserId, getIncomingFundsByAmount, getIncomingFundsByAmountAbove, getIncomingFundsByAmountBelow, getIncomingFundsByAmountBetween, getIncomingFundsBySource, getIncomingFundsBeforeDate, getIncomingFundsAfterDate, getIncomingFundsBetweenDates, updateIncomingFund, deleteIncomingFund } = require ('./incomingDeposits');

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
                amount TEXT NOT NULL,
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

// Method: createInitialTransactions
async function createInitialTransactions() {
    console.log("Creating initial transactions...");
    try {
        // Example transaction details with specific dates
        const transactions = [
            { user_id: 1, account_id: 1, amount: 100.00, status: 'completed', transaction_date: '2023-05-15' },
            { user_id: 1, account_id: 1, amount: 150.50, status: 'pending', transaction_date: '2023-06-20' },
            { user_id: 1, account_id: 2, amount: 200.00, status: 'completed', transaction_date: '2023-07-10' }
        ];

        for (let transaction of transactions) {
            await createTransaction(transaction);
        }
        console.log("Initial transactions created successfully.");
    } catch (error) {
        console.error("Error creating initial transactions:", error);
    }
};

// Methods: createInitialDistributionRules
async function createInitialDistributionRules() {
    console.log("Creating initial distribution rules...");
    try {
        await createDistributionRule({
            user_id: 1,
            account_id: 1,
            percentage: 50.00
        });
        await createDistributionRule({
            user_id: 1,
            account_id: 2,
            percentage: 50.00
        });

        console.log("Initial distribution rules created successfully.");
    } catch (error) {
        console.error("Error creating initial distribution rules!");
        console.error(error);
    }
};

// Methods: createInitialIncomingDeposits
async function createInitialIncomingDeposits() {
    console.log("Creating initial incoming deposits...");
    try {
        await createIncomingFund({
            user_id: 1,
            amount: 1500.00,
            source: 'Salary',
            received_date: '2023-05-10'
        });
        await createIncomingFund({
            user_id: 1,
            amount: 200.00,
            source: 'Freelance Work',
            received_date: '2023-06-15'
        });
        await createIncomingFund({
            user_id: 1,
            amount: 500.00,
            source: 'Investment Return',
            received_date: '2023-07-01'
        });

        console.log("Initial incoming deposits created successfully.");
    } catch (error) {
        console.error("Error creating initial incoming deposits!");
        console.error(error);
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
        await createInitialTransactions();
        await createInitialDistributionRules();
        await createInitialIncomingDeposits();
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
        // // Test retrieving all accounts for a user
        // console.log("Calling getAllAccountsByUserId...");
        // const userAccounts = await getAllAccountsByUserId(1);
        // console.log("Retrieved accounts for user ID 1:", userAccounts);

        // // Test getAccountById
        // console.log("Calling getAccountById for the first account...");
        // const accountById = await getAccountById(userAccounts[0].id);
        // console.log("Account by ID:", accountById);

        // // Test getAccountByAccountNumber
        // console.log("Calling getAccountByAccountNumber...");
        // const accountByNumber = await getAccountByAccountNumber(userAccounts[0].account_number);
        // console.log("Account by Account Number:", accountByNumber);

        // // Test getAllAccountsByRoutingNumber
        // console.log("Calling getAllAccountsByRoutingNumber...");
        // const accountsByRoutingNumber = await getAllAccountsByRoutingNumber(userAccounts[0].routing_number);
        // console.log("Accounts by Routing Number:", accountsByRoutingNumber);

        // // Test updating an account
        // console.log("Calling updateAccount...");
        // const updatedAccount = await updateAccount(userAccounts[0].id, {
        //     account_name: 'Updated Main Savings Account',
        //     account_number: '112233445566'
        // });
        // console.log("Updated account:", updatedAccount);

        // // Test deleting an account
        // console.log("Calling deleteAccount...");
        // const deleteResult = await deleteAccount(userAccounts[1].id);
        // console.log("Deleted account result:", deleteResult);
    
    // Test Transactions.js Helper.js FNs
        // // Test createTransaction
        // console.log("Creating initial transactions...");
        // const transaction1 = await createTransaction({
        //     user_id: 1,
        //     account_id: 1,
        //     amount: '100.00',
        //     status: 'completed',
        //     transaction_date: '2023-05-01'
        // });
        // const transaction2 = await createTransaction({
        //     user_id: 1,
        //     account_id: 2,
        //     amount: '200.00',
        //     status: 'pending',
        //     transaction_date: '2023-07-01'
        // });
        // console.log("Transactions created:", transaction1, transaction2);

        // // Test getTransactionById
        // console.log("Calling getTransactionById...");
        // const singleTransactionById = await getTransactionById(transaction1.id);
        // console.log("Transaction by ID:", singleTransactionById);

        // // Test getTransactionsByUserId
        // console.log("Calling getTransactionsByUserId...");
        // const userTransactions = await getTransactionsByUserId(1);
        // console.log("Transactions for user ID 1:", userTransactions);

        // // Test getTransactionsByAccountId
        // console.log("Calling getTransactionsByAccountId...");
        // const accountTransactions = await getTransactionsByAccountId(1);
        // console.log("Transactions for account ID 1:", accountTransactions);

        // // Test getTransactionsByAmount
        // console.log("Calling getTransactionsByAmount...");
        // const transactionsByAmount = await getTransactionsByAmount('100.00');
        // console.log("Transactions by amount 100.00:", transactionsByAmount);

        // // Test getTransactionsByDate
        // console.log("Calling getTransactionsByDate...");
        // const transactionsByDate = await getTransactionsByDate('2023-05-01');
        // console.log("Transactions on date 2023-05-01:", transactionsByDate);

        // // Test getTransactionsByStatus
        // console.log("Calling getTransactionsByStatus...");
        // const transactionsByStatus = await getTransactionsByStatus('pending');
        // console.log("Transactions with status 'pending':", transactionsByStatus);

        // // Test getTransactionsBeforeDate
        // console.log("Calling getTransactionsBeforeDate...");
        // const transactionsBeforeDate = await getTransactionsBeforeDate('2023-06-01');
        // console.log("Transactions created before June 2023:", transactionsBeforeDate);

        // // Test getTransactionsAfterDate
        // console.log("Calling getTransactionsAfterDate...");
        // const transactionsAfterDate = await getTransactionsAfterDate('2023-06-01');
        // console.log("Transactions created after June 2023:", transactionsAfterDate);

        // // Test getTransactionsBetweenDates
        // console.log("Calling getTransactionsBetweenDates...");
        // const transactionsBetweenDates = await getTransactionsBetweenDates('2023-05-01', '2023-07-01');
        // console.log("Transactions created between May 2023 and July 2023:", transactionsBetweenDates);

        // // Test getAllTransactions
        // console.log("Calling getAllTransactions...");
        // const allTransactions = await getAllTransactions();
        // console.log("All transactions:", allTransactions);
    
    // Test distributionRules.js Helper FNs
        // // Test createDistributionRule
        // console.log("Creating initial distribution rules...");
        // const rule1 = await createDistributionRule({
        //     user_id: 1,
        //     account_id: 1,
        //     percentage: 50.00
        // });
        // const rule2 = await createDistributionRule({
        //     user_id: 1,
        //     account_id: 2,
        //     percentage: 50.00
        // });
        // console.log("Distribution rules created:", rule1, rule2);

        // // Test getRuleById
        // console.log("Calling getRuleById...");
        // const singleRuleById = await getRuleById(rule1.id);
        // console.log("Rule by ID:", singleRuleById);

        // // Test getRulesByUserId
        // console.log("Calling getRulesByUserId...");
        // const userRules = await getRulesByUserId(1);
        // console.log("Rules for user ID 1:", userRules);

        // // Test updateRule
        // console.log("Calling updateRule...");
        // const updatedRule = await updateRule(rule1.id, { percentage: 60.00 });
        // console.log("Updated rule:", updatedRule);

        // // Test deleteRule
        // console.log("Calling deleteRule...");
        // const deletedRule = await deleteRule(rule2.id);
        // console.log("Deleted rule:", deletedRule);

    // Test IncomingDeposits.js Helper FNs
        // // Test createIncomingFund
        // console.log("Creating initial incoming deposits...");
        // const deposit1 = await createIncomingFund({
        //     user_id: 1,
        //     amount: 1500.00,
        //     source: 'Salary',
        //     received_date: '2023-05-10'
        // });
        // const deposit2 = await createIncomingFund({
        //     user_id: 1,
        //     amount: 200.00,
        //     source: 'Freelance Work',
        //     received_date: '2023-06-15'
        // });
        // const deposit3 = await createIncomingFund({
        //     user_id: 1,
        //     amount: 500.00,
        //     source: 'Investment Return',
        //     received_date: '2023-07-01'
        // });
        // console.log("Incoming deposits created:", deposit1, deposit2, deposit3);

        // // Test getIncomingFundById
        // console.log("Calling getIncomingFundById...");
        // const singleDepositById = await getIncomingFundById(deposit1.id);
        // console.log("Incoming fund by ID:", singleDepositById);

        // // Test getIncomingFundsByUserId
        // console.log("Calling getIncomingFundsByUserId...");
        // const userDeposits = await getIncomingFundsByUserId(1);
        // console.log("Incoming funds for user ID 1:", userDeposits);

        // // Test getIncomingFundsByAmount
        // console.log("Calling getIncomingFundsByAmount...");
        // const depositsByAmount = await getIncomingFundsByAmount(200.00);
        // console.log("Incoming funds with amount 200.00:", depositsByAmount);

        // // Test getIncomingFundsByAmountAbove
        // console.log("Calling getIncomingFundsByAmountAbove...");
        // const depositsByAmountAbove = await getIncomingFundsByAmountAbove(1000.00);
        // console.log("Incoming funds with amount above 1000.00:", depositsByAmountAbove);

        // // Test getIncomingFundsByAmountBelow
        // console.log("Calling getIncomingFundsByAmountBelow...");
        // const depositsByAmountBelow = await getIncomingFundsByAmountBelow(1000.00);
        // console.log("Incoming funds with amount below 1000.00:", depositsByAmountBelow);

        // // Test getIncomingFundsByAmountBetween
        // console.log("Calling getIncomingFundsByAmountBetween...");
        // const depositsByAmountBetween = await getIncomingFundsByAmountBetween(200.00, 1500.00);
        // console.log("Incoming funds with amount between 200.00 and 1500.00:", depositsByAmountBetween);

        // // Test getIncomingFundsBySource
        // console.log("Calling getIncomingFundsBySource...");
        // const depositsBySource = await getIncomingFundsBySource('Freelance Work');
        // console.log("Incoming funds with source 'Freelance Work':", depositsBySource);

        // // Test getIncomingFundsBeforeDate
        // console.log("Calling getIncomingFundsBeforeDate...");
        // const depositsBeforeDate = await getIncomingFundsBeforeDate('2023-06-01');
        // console.log("Incoming funds before date 2023-06-01:", depositsBeforeDate);

        // // Test getIncomingFundsAfterDate
        // console.log("Calling getIncomingFundsAfterDate...");
        // const depositsAfterDate = await getIncomingFundsAfterDate('2023-06-01');
        // console.log("Incoming funds after date 2023-06-01:", depositsAfterDate);

        // // Test getIncomingFundsBetweenDates
        // console.log("Calling getIncomingFundsBetweenDates...");
        // const depositsBetweenDates = await getIncomingFundsBetweenDates('2023-05-01', '2023-07-01');
        // console.log("Incoming funds between dates 2023-05-01 and 2023-07-01:", depositsBetweenDates);

        // // Test updateIncomingFund
        // console.log("Calling updateIncomingFund...");
        // const updatedDeposit = await updateIncomingFund(deposit1.id, { amount: 1600.00 });
        // console.log("Updated deposit:", updatedDeposit);

        // // Test deleteIncomingFund
        // console.log("Calling deleteIncomingFund...");
        // const deletedDeposit = await deleteIncomingFund(deposit3.id);
        // console.log("Deleted deposit:", deletedDeposit);

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