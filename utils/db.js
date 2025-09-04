import mysql from "mysql";

const con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "Employeemanagement2",
});

con.connect(function(err){
    if(err){
        console.log("Connection error:", err);
    } else {
        console.log("Connected to MySQL database - Employeemanagement2");
    }
});

export default con;