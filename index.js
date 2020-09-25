const express = require('express')
const app = express()
const PORT = 5000
const mysql = require('mysql')
const multer = require('multer')

// diskStorage
// Filter
// file || files



var diskStorage = multer.diskStorage({
    destination : (req,file,next) => {
        next(null , 'storage')
    },
    filename : (req,file,next) => {
        next(null, 'PIMG-' + Date.now() + '.' + file.mimetype.split('/')[1])
    }
})

var testUpload = multer({storage : diskStorage}).single('image')

require('dotenv').config()

const db = mysql.createConnection({
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    port : process.env.DB_PORT
})


app.get('/' ,(req,res) => {
    res.send("<h1>Welcome</h1)")
})

app.post('/product'  ,(req,res) => {
    // {name dan price} ==> products
    // {id_product , images} ==> product_images
})

app.post('/testupload',(req,res) => {
    testUpload(req,res,(err) => {
        try {
            if(err) throw err
            if(req.file === undefined) throw 'File not found' 

            console.log(req.file)
            res.send('sukses')
            
        } catch (error) {
            res.json({
                error : true,
                message : "Multer Error",
                detail : error
            })
        }
    })

})





app.listen(PORT, () => console.log("API RUNNING ON PORT " + PORT))