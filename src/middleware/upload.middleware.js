const multer = require('multer')

const upload = multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:10*1024*1024
    },
    fileFilter:(req,file,cb)=>{
        const allowedTypes =[
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];
        if(!allowedTypes.includes(file.mimetype)){
            const err = new Error("only pdf jpeg or png files are allowed")
            return cb(err)
       
        }
        cb(null,true) // koi error nhi  ha or  file accept karo

    }
})

module.exports = upload