const express = require('express')
const app = express()
const PORT = 5000
const mysql = require('mysql')

require('dotenv').config()

const db = mysql.createConnection({
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    port : process.env.DB_PORT
})



app.get('/' ,(req,res) => {
    res.send("Welcome")
})





app.listen(PORT, () => console.log("API RUNNING ON PORT " + PORT))