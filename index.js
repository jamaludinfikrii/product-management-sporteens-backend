const express = require('express')
const app = express()
const PORT = 5000
const mysql = require('mysql')
const upload = require('./helpers/multerUploadSingle')()
const multer = require('multer')
const deleteImages = require('./helpers/deleteImages')

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
    upload(req,res,(err) => {
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
                var dataParsed = JSON.parse(data)
            } catch (error) {
                console.log(error)
            }
            
            

            // insert query data to products
            db.query('insert into products set ?',dataParsed,(err,result) => {
                try {
                    if(err) throw err
                    let id_product = result.insertId
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

const storage = multer.diskStorage({
    destination : (req,file,next) => {
        next(null,'storage')
    },
    filename : (req,file,next) => {
        next(null,'IMG-' + Date.now() + '.' + file.mimetype.split('/')[1])
    }
})

const fileFilter = (req,file,next) => {
    try {
        if(file.mimetype.includes('image') === false) throw 'File Must Be An Image'
        next(null,true)
    } catch (error) {
        req.multerFilterError = error
        next(null,false)
    }
}


const upload2 = multer({storage : storage, fileFilter : fileFilter,limits : {fileSize : 110000}}).array('images',5)





app.post('/products-2' , (req,res) => {
    upload2(req,res,(err) =>{
        
        try {
            if(err) throw err
            console.log(req.files)
            let dataParsed = JSON.parse(req.body.data)
            console.log(dataParsed)

            // db.query('insert into products set ?', dataParsed , (err,result) => {
            //     try {
            //         if(err) throw err
            //         let id = result.insertId

            //         // generate array of array
            //         let dataToInsert = req.files.map((val) =>{ 
            //             return [
            //                 'http://localhost:5000/' + val.path,
            //                 id
            //             ]
            //         })

            //         console.log(dataToInsert)

            //         db.query('insert into product_images (image,id_product) values ?',[dataToInsert],(err,result) => {
            //             try {
            //                 if(err) throw err
            //                 res.send("Insert data success")
            //             } catch (error) {
            //                 deleteImages(req.files.map((val) => val.path) , req,res)
            //                 res.json({
            //                     error : true,
            //                     error
            //                 })
            //             }
                    
            //         })

            //     } catch (error) {
            //         deleteImages(req.files.map((val) => val.path) , req,res)
            //         // delete image
            //         res.json({
            //             error : true,
            //             error
            //         })
            //     }
            // })

            // db.beginTransaction((err) => {
            //     try {
            //         if(err) throw err

            //         db.query('insert into products set ?', dataParsed , (err,result) => {
            //             if(err){
            //                 return db.rollback(() =>{ 
            //                     try {
            //                         if(err) throw err

            //                         console.log(result)
            //                         let id = result.insertId
            //                         // generate array of array
            //                         let dataToInsert = req.files.map((val) =>{ 
            //                             return [
            //                                 'http://localhost:5000/' + val.path,
            //                                 id
            //                             ]
            //                         })
            //                         console.log(dataToInsert)
            //                         console.log('masuk1')
            //                         db.query('insert into product_images1 (image,id_product) values ?',[dataToInsert],(err,result) => {
            //                             if(err){
            //                                 return db.rollback(() => {
            //                                     console.log('masuk2')
            //                                     try {
            //                                         if(err) throw err
            //                                     } catch (error) {
            //                                         deleteImages(req.files.map((val) => val.path) , req,res)
            //                                         // delete image
            //                                         res.json({
            //                                             error : true,
            //                                             error
            //                                         })
            //                                     }
            //                                 })
            //                             }
            //                         })


            //                     } catch (error) {
            //                         deleteImages(req.files.map((val) => val.path) , req,res)
            //                         // delete image
            //                         res.json({
            //                             error : true,
            //                             error
            //                         })
            //                     }
            //                 })
            //             }
            //         })
                    
            //     } catch (error) {
            //         deleteImages(req.files.map((val) => val.path) , req,res)
            //         // delete image
            //         res.json({
            //             error : true,
            //             error
            //         })
            //     }
            // })


            db.beginTransaction((err) => {
                if(err) throw err
                db.query('insert into products set ?',dataParsed,(err,result) => {
                    if(err){
                        deleteImages(req.files.map((val) => val.path) , req,res)
                        return db.rollback(() => {
                            throw err;
                        })
                    }
                    let id = result.insertId
                    // generate array of array
                    let dataToInsert = req.files.map((val) =>{ 
                        return [
                            'http://localhost:5000/' + val.path,
                            id
                        ]
                    })
                    console.log(dataToInsert)
                    console.log('masuk1')

                    db.query('insert into product_images (image,id_product) values ?' , [dataToInsert] ,(err,result) => {
                        if(err) {
                            deleteImages(req.files.map((val) => val.path) , req,res)
                            return db.rollback(() => {
                                throw err
                            })
                        }

                        db.commit((err) => {
                            if(err){
                                deleteImages(req.files.map((val) => val.path) , req,res)
                                return db.rollback(() => {
                                    throw err
                                })
                            }

                            res.send('success')
                        })
                    })

                })
            })
            
        } catch (error) {
            deleteImages(req.files.map((val) => val.path) , req,res)
            // delete image
            res.json({
                error : true,
                error
            })
        }
    })
})



const test = () => {
    connection.beginTransaction(function(err) {
        if (err) { throw err; }
        connection.query('INSERT INTO posts SET title=?', title, function (error, results, fields) {
          if (error) {
            return connection.rollback(function() {
              throw error;
            });
          }
      
          var log = 'Post ' + results.insertId + ' added';
      
          connection.query('INSERT INTO log SET data=?', log, function (error, results, fields) {
            if (error) {
              return connection.rollback(function() {
                throw error;
              });
            }
            connection.commit(function(err) {
              if (err) {
                return connection.rollback(function() {
                  throw err;
                });
              }
              console.log('success!');
            });
          });
        });
      });
      
}


app.listen(PORT, () => console.log("API RUNNING ON PORT " + PORT))


// update product + image
    // updata product di database
    // update product image di database
    // delete old image di storage

// delete product
    // delete product di database
    // delete product_image di database
    // delete image di storage