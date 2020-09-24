const express = require('express')
const app = express()
const PORT = 5000
const mysql = require('mysql')
const multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'storage')
    },
    filename: function (req, file, cb) {

        cb(null, 'PROD' + '-' + Date.now() + '.' +file.mimetype.split('/')[1])
    }
})


const multerMiddleware = multer({storage : storage}).single('image_1')


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

app.use('/storage', express.static('storage'))

app.post('/product' , multerMiddleware ,(req,res) => {
    const file = req.file
    
})





app.listen(PORT, () => console.log("API RUNNING ON PORT " + PORT))