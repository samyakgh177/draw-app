import { WebSocketServer, WebSocket } from 'ws';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}
const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded !== "object" || !decoded.userId) return null;
        return decoded.userId;
    } catch {
        return null;
    }
}

wss.on('connection', async (ws, request) => {
    try {
        const url = request.url;
        if (!url) return ws.close();

        const queryParams = new URLSearchParams(url.split('?')[1]);
        const token = queryParams.get('token') || "";
        const userId = checkUser(token);
        if (!userId) return ws.close();

        users.push({ userId, rooms: [], ws });

        ws.on('message', async (data) => {
            try {
                const parsedData = JSON.parse(data.toString());
                const user = users.find(u => u.ws === ws);
                if (!user) return;

                if (parsedData.type === "join_room") {
                    const roomId = parsedData.roomId?.toString();
                    if (roomId && !user.rooms.includes(roomId)) {
                        user.rooms.push(roomId);
                    }
                }

                if (parsedData.type === "leave_room") {
                    user.rooms = user.rooms.filter(r => r !== parsedData.roomId?.toString());
                }

                if (parsedData.type === "chat") {
                    const roomId = parsedData.roomId?.toString();
                    const message = parsedData.message;
                    if (!roomId || !message) return;

                    await prismaClient.chat.create({
                        data: {
                            roomId: parseInt(roomId),
                            message,
                            userId
                        }
                    });

                    users.forEach(u => {
                        if (u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
                            u.ws.send(JSON.stringify({ type: "chat", message, roomId }));
                        }
                    });
                }
            } catch (error) {
                ws.send(JSON.stringify({ error: "Invalid message format" }));
            }
        });
    } catch (error) {
        ws.send(JSON.stringify({ error: "Unexpected server error" }));
        ws.close();
    }
});
