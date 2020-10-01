const express = require('express')
const app = express()
const PORT = 5000
const mysql = require('mysql')
const cors = require('cors')
const upload = require('./helpers/multerUploadSingle')()
const multer = require('multer')
const deleteImages = require('./helpers/deleteImages')
require('dotenv').config()

app.use(cors())

const db = mysql.createConnection({
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    port : process.env.DB_PORT
})


app.get('/' ,(req,res) => {
    res.send("<h1>Welcome</h1)")
})

app.use('/storage',express.static('storage'))

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
        next(null,'IMG-' + Date.now() + Math.random() * 1000 + '.' + file.mimetype.split('/')[1])
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


const upload2 = multer({storage : storage, fileFilter : fileFilter,limits : {fileSize : 1000000}}).array('images',5)





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



app.delete('/product/:id_product' , (req,res) => {
    const id_product = req.params.id_product

    try {
        if(!id_product) throw {message : "id product cannot null"}

        db.beginTransaction((err) => {
            if(err) throw err
            // pertama delete product
            db.query('delete from products where id = ?',id_product , (err,result) => {
                if(err){
                    deleteImages(req.files.map((val) => val.path) , req,res)
                    return db.rollback(() => {
                        throw err
                    })
                }

                // get path old image
                db.query('select image from product_images where id_product = ?' , id_product , (err,result) => {
                    if(err){
                        deleteImages(req.files.map((val) => val.path) , req,res)
                        return  db.rollback(() => {
                            throw err
                        })
                    }
                    // result = [
                    //     {image : "path1"},
                    //     {image : "path2"},
                    //     {image : "path3"},
                    // ]

                    // result = ['path1','path2','path3']
                    
                    // transform data structure
                    let oldImagePath = result.map((val) => {
                        return val.image.replace('http://localhost:5000/','')
                    })

                    // delete images on database
                    db.query('delete from product_images where id_product = ?', id_product,(err,result) => {
                        if(err){
                            deleteImages(req.files.map((val) => val.path) , req,res)
                            return db.rollback(() => {
                                throw err
                            })
                        }

                        // delete images on api
                        deleteImages(oldImagePath,req,res)

                        db.commit((err) => {
                            if(err){
                                return db.rollback(() => {
                                    throw err
                                })
                            }

                            res.json({
                                error : false,
                                message : "Delete Data Success"
                            })
                        })
                    })


                })


            })
        })
        

    } catch (error) {
        
    }
   
})


app.patch('/product/:id_product' , (req,res) => {
    // upload image to api
    upload2(req,res,(err) => {
        try {
            if(err) throw err
            
            // edit data price and name
            let dataToEdit = req.body.data
            dataToEdit = JSON.parse(dataToEdit)
            const id = req.params.id_product

            db.beginTransaction((err) => {
                if(err) throw err
                db.query('update products set ? where id = ?',[dataToEdit,id],(err,result) => {
                    if(err){
                        return db.rollback(() => {
                            throw err
                        })
                    }

                   
                   
                    // get old image path
                    db.query('select image from product_images where id_product = ?' , id,(err,result) => {
                        if(err){
                            return db.rollback(() => {
                                throw err
                            })
                        }
                        //   result = [
                        //     {image : "path1"},
                        //     {image : "path2"},
                        //     {image : "path3"},
                        // ]

                        // result = ['path1','path2','path3']
                        let oldImagePath = result.map((val) => {
                            return val.image.replace('http://localhost:5000/','')
                        })


                        // delete old image path on database
                        db.query('delete from product_images where id_product = ?',id,(err,result) => {
                            if(err){
                                return db.rollback(() => {
                                    throw err
                                })
                            }

                            

                            // insert new image path to database
                            // generate array of array
                            let dataToInsert = req.files.map((val) =>{ 
                                return [
                                    'http://localhost:5000/' + val.path,
                                    id
                                ]
                            })
                            db.query('insert into product_images (image,id_product) values ?',[dataToInsert],(err,result) => {
                                if(err){
                                    db.rollback(() => {
                                        throw err
                                    })
                                }

                                // delete old image path on api
                                deleteImages(oldImagePath,req,res)

                                db.commit((err) => {
                                    if(err){
                                        return db.rollback(() => {
                                            throw err
                                        })
                                    }
        
                                    res.json({
                                        error : false,
                                        message : "Update Data Success"
                                    })
                                })

                            })
                        })

                    })

                })
            })


           


           
            
           



        } catch (error) {
            
        }
    })
} )



app.get('/products',(req,res) => {
    db.query(`select p.id as id_product, name, price, pi.id as id_image, image from products p
    join product_images pi on p.id = pi.id_product;`, (err,result) => {
        try {

            // result = [
            //     {prod : 'prod 1',img : 'img prod 1'},
            //     {prod : 'prod 1',img : 'img prod 1'},
            //     {prod : 'prod 1',img : 'img prod 1'},
            //     {prod : 'prod 2',img : 'img prod 2'},
            //     {prod : 'prod 2',img : 'img prod 2'},
            // ]

            // result = [
            //     {prod : 'prod 1' ,imgs : [{id_img , path}]}
            // ]

            // {id_product: 3, name: "NIKE AIR MAX 270 REACT BAUHAUS", price: 1200000, id_image: 6, image: "http://localhost:5000/storage/IMG-1601436310499139.24555834007245.jpeg"}
            let dataTransformed = []
            if(err) throw err

            result.forEach((val,idx) => {

                let indexExist = null

                // check the id product exist on dataTransformed
                dataTransformed.forEach((find,index) => {
                    if(find.id_product === val.id_product){
                        indexExist = index
                    }
                })
                
                // if Exist
                if(indexExist !== null){
                    // push image data only
                    dataTransformed[indexExist].images.push({id : val.id_image, path : val.image})

                    // if not exist
                }else{

                    // push data product and image
                    dataTransformed.push({
                        id_product : val.id_product,
                        name : val.name,
                        price : val.price,
                        images : [
                            {id : val.id_image, path : val.image}
                        ]
                    })
                }
            })

            
            res.json({
                error : false,
                data : dataTransformed
            })
        } catch (error) {
            res.json({
                error : true,
                data : error
            })
        }
    })
})


app.listen(PORT, () => console.log("API RUNNING ON PORT " + PORT))


// update product + image
    // updata product di database
    // update product image di database
    // delete old image di storage

// delete product
    // delete product di database
    // delete product_image di database
    // delete image di storage