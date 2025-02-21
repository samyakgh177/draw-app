import express from 'express';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';
import { CreateRoomSchema, CreateUserSchema } from '@repo/common/types';
import { prismaClient } from '@repo/db/client';
const app = express();


app.post("/signup", (req, res) => {
    const data = CreateUserSchema.safeParse(req.body);
    const user = prismaClient.user.create({
        data:{
            email:req.body.email,
            password:req.body.password
        }
    })
    if(!data.success){
        res.status(400).json({
            message:"Incorrect inputs"
        })
    }
})

app.post("signin", (req, res) => {

    const userId = 1;
    const token = jwt.sign({
        userId
    },JWT_SECRET)
    res.json({
        token
    })

})
app.post("/room",middleware,(req,res)=>{
    //db call
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
        res.status(400).json({
            message:"Incorrect inputs"
        })
        return;
    }
    res.json({
        roomId:123
    })
})


app.listen(3001)