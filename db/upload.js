const multer = require('multer')
const storage = require('./storage')
const path = require('path')

const upload = multer({ storage,
    fileFilter: function (req, file, callback) {
        // var ext = path.extname(file.originalname);
        // png jpg gif and jpeg allowed
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            callback(new Error('Please upload valid jpg, png or jpeg format file'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 50 * 1000000 // 50 Mb limit imposed
    } 
})

module.exports =  upload