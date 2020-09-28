const fs = require('fs')
const deleteImages = (files,req,res) => {
    files.forEach((val) => {
        try {
            fs.unlinkSync(val)
        } catch (error) {
            res.send(error)
        }
    })
} 


module.exports = deleteImages