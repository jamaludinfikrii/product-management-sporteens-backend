const express = require('express')
const app = express()
const PORT = 5000
const mysql = require('mysql')
const multer = require('multer')
const { json } = require('express')

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

var fileFilter = (req,file,next) => {
    try {
        if(file.mimetype.includes('image') === false) throw 'File Must Be An Image'
        next(null,true)
    } catch (error) {
        req.bebas = error
        next(null,false)
    }
}

var testUpload = multer({storage : diskStorage , fileFilter : fileFilter , limits : {fileSize : 200000}}).single('image')

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
    testUpload(req,res,(err) => {
        try {
            if(err) throw err
            
            // req.validation for file filtering
            if(req.bebas) throw req.bebas
            if(req.file === undefined) throw 'File Not Found'

            // get image path 
            var imagePath = 'http://localhost:4000/' + req.file.path
            console.log(imagePath)

            // get text data {price and name}
            var data = req.body.data
            try {
                var dataPased = JSON.parse(data)
            } catch (error) {
                console.log(error)
            }
            console.log(dataPased)
            
            

            // insert query data to products
            db.query('insert into products set ?',data,(err,result) => {
                const id_product = result.insertId
                try {
                    if(err) throw err

                    // insert path and id_product
                    db.query('insert into product_images set ?',{image : imagePath , id_product},(err,result) => {
                        try {
                            if(err) throw err
                            res.json({
                                error : false,
                                message : "Insert Data Success"
                            })
                        } catch (error) {
                            res.json({
                                error : true,
                                message : "Error insert product image",
                                detail : error
                            })
                        }
                    })
                } catch (error) {
                    res.json({
                        error : true,
                        message : "Error insert product data",
                        detail : error
                    })
                }

            })


        } catch (error) {
            
        }
    })

})

app.post('/testupload',(req,res) => {
    testUpload(req,res,(err) => {
        try {
            if(err) throw err
            if(req.fileValidation) throw req.fileValidation
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