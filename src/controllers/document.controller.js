const {GetObjectCommand,DeleteObjectCommand,PutObjectCommand} = require("@aws-sdk/client-s3");
const {v4:uuidv4} = require("uuid");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner")
const s3 = require('../services/s3');
const logger = require('../utils/logger')
const uploadNotification = require('../services/sns.service')
const {dbCon} = require("../config/db");
const {putMetric} = require("../services/cloudwatch.service")


const uploadDocument = async(req,res,next)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"Document is required"
            })
        }
        const file = req.file;
        const userId = req.user.user_id;
        const fileName = file.originalname.replace(/[^a-zA-z0-9._-]/g,"_")
        
        const objectKey = `users/${userId}/documents/${uuidv4()}-${fileName}`; 
        const command = new PutObjectCommand({
            Bucket:process.env.AWS_S3_BUCKET,
            Key:objectKey,
            Body:file.buffer,
            ContentType:file.mimetype,
            ServerSideEncryption:"AES256"
        })

        //s3 upload
        try{
        await s3.send(command);
        }catch(error){
            await putMetric("s3operationFailureCount",1,"Count");
            logger.error("s3 upload failed",{
                userId:userId,
                objectKey:objectKey,
                error:error.message
            });
            throw error
        }
    
        //mysql metadata
        const [result] = await dbCon.execute(
            `insert into documents (user_id,original_name,s3_key,file_size,mime_type)
            values(?,?,?,?,?)`,
            [userId,file.originalname,objectKey,file.size,file.mimetype]
        );

        //upload success
        logger.info("Document uploaded successfully",{
            userId:userId,
            documentId:result.insertId,
            objectKey:objectKey,
            fileName:file.originalname,
            fileSize:file.size
        })

      // Upload success metric
        await putMetric("UploadSuccessCount",1,"Count");

        //sns Notification
       try{
        await uploadNotification({
            userId: userId,
            objectKey: objectKey,
            fileName: fileName

        })
        
        logger.info("sns notification sent",{
            userId:userId,
            objectKey:objectKey
        })
    }catch(error){
        await  putMetric("SNS publishFailureCount",1,"Count");
        logger.error("SNS Notification failed",{
            userId:userId,
            objectKey:objectKey,
            error:error.message
        })

    }

        return res.status(201).json({
            success:true,
            message:"Document uploaded successfully",
            document:{
                id:result.insertId,
                originalName:file.originalname,
                size:file.size,
                mimeType:file.mimetype
            }
        })
    }
    catch(error){
        await putMetric("UploadFailureCount",1,"Count")
        logger.error("Document upload failed",{
            userId:req.user?.user_id || null,
            route:req.originalUrl,
            error:error.message
        })
        next(error)
    }

}
const getDocuments = async (req,res,next) =>{
        try{
            const userId = req.user.user_id;

            const  [documents] = await dbCon.execute(
                `select id,original_name,file_size,mime_type,created_at from documents where user_id = ? order by created_at desc`,[userId]
            );
            return res.status(200).json({
                success:true,
                count: documents.length,
                documents
            })
        }catch(error){
            next(error)
        }
    }


const downloadDocument = async (req,res,next)=>{
    try{
        const userId = req.user.user_id;
        const documentId = req.params.id;

        const[documents] = await dbCon.execute(
            `select * from documents where id = ? and user_id = ?`,[documentId,userId]
        );
        if(documents.length === 0){
            return res.status(404).json({
                success:false,
                message:"document not found"
            })
        }
        const document = documents[0];
        const command = new GetObjectCommand({
            Bucket:process.env.AWS_S3_BUCKET,
            Key:document.s3_key
        });

        const downloadURl = await getSignedUrl(
            s3,command,
            {
                expiresIn: 300
            }
        );
        
        return res.status(200).json({
            success:true,
            downloadURl
        })
    }catch(error){
        next(error)
    }
}

const deleteDocument = async (req,res,next)=>{
    try{
        const userId = req.user.user_id;
        const documentId = req.params.id;

        const [documents] = await dbCon.execute(
            `select * from documents where id = ? and user_id = ?`,[documentId,userId]
        );
        if(documents.length === 0){
            return res.status(404).json({
                success:false,
                message: "document not found"
            })
        }
        const document  = documents[0];
      // delete from s3
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key:document.s3_key
        })
        await s3.send(command)

        //delete metadata from mysql
        await dbCon.execute(
            `delete from documents where id = ? and user_id = ?`,[documentId,userId]
        );

        return res.status(200).json({
            success:true,
            message:"document deleted successfully"
        })
    }catch(error){
        next(error)
    }
}

module.exports ={uploadDocument,getDocuments,downloadDocument,deleteDocument}