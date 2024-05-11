// Import Client & Exports;
const { client } = require('./index');

// File Imports



// Methods: Drop Tables
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
}
