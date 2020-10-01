const multer = require('multer')
const multerUploadSingle = () => {

    var diskStorage = multer.diskStorage({
        destination : (req,file,next) => {
            next(null , 'storage')
        },
        filename : (req,file,next) => {
            next(null, 'PIMG-' + Date.now() + Math.random() * 1000  +'.' + file.mimetype.split('/')[1])
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

    var upload = multer({storage : diskStorage , fileFilter : fileFilter , limits : {fileSize : 200000}}).single('image')
    return upload
}


module.exports = multerUploadSingle