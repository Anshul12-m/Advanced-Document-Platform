const mysql = require('mysql2/promise');

 const dbCon = mysql.createPool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
    database:process.env.DB_NAME

 });
 
 const testDatabaseConnection = async()=>{
    try{
        const connection = await pool.getConnection();

        console.log("mysql connected successfully");
        connection.release()
    }catch(error){
       console.error("database connection failed",error.message)
       process.exit(1)
    }
 };

 module.exports = {dbCon,testDatabaseConnection}