import express, { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from '@repo/common/types';
import { prismaClient } from '@repo/db/client';
import bcrypt, { hash } from 'bcrypt';
const app = express();
app.use(express.json());
const saltRounds = 10;


app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            message: "Incorrect inputs"
        })
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(parsedData.data.password, saltRounds);
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                password: hashedPassword,
                // Todo: hash the password
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch (e) {
        res.status(411).json({
            message: "User already exists"
        })
    }


})

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            message: "Incorrect inputs"
        });
        return;
    }

    try {
        const user = await prismaClient.user.findUnique({
            where: { email: parsedData.data.username }
        });

        if (!user) {
            res.status(403).json({
                message: "Not authorized"
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);
        if (!isPasswordValid) {
            res.status(403).json({
                message: "Not authorized"
            });
            return;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Incorrect inputs"
        });
        return;
    }

    // @ts-ignore
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({
            message: "Authentication required"
        });
        return;
    }

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                admin: {
                    connect: {
                        id: userId
                    }
                }
            }
        });

        res.json({
            roomId: room.id
        });
    } catch (e) {
        console.error("Room creation error:", e);

        res.status(411).json({
            message: "Room creation error"
        });
    }
});

app.get("/chats/:roomId", async(req,res)=>{
    const roomId = Number(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
        where: {
            roomId:roomId
        },
        orderBy:{
            id:"desc"
        },
        take:50
    });
    res.json({
        messages
    })
})

app.listen(3001)