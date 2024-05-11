// Import Client & Exports;
const { client } = require('./index');

// File Imports



// Methods: dropTables
async function dropTables(){
    try {
        console.log("Dropping tables... ");
        await client.query(`
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS accounts CASCADE;
            DROP TABLE IF EXISTS transactions CASCADE;
            DROP TABLE IF EXISTS distribution_rules CASCADE;
            DROP TABLE IF EXISTS incoming_funds CASCADE;
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
                role VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Finished building tables.');
    } catch (error) {
        console.error('Error building tables!');
        console.log(error);
    }
};