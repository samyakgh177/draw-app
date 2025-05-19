import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

// Define types
interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

// Set up WebSocket server
const wss = new WebSocketServer({ port: 8080 });
const users: User[] = [];

// Validate JWT token and extract userId
function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (typeof decoded === "string") {
      return null;
    }
    
    if (!decoded || !('userId' in decoded)) {
      return null;
    }
    
    return decoded.userId as string;
  } catch(e) {
    console.error("JWT verification failed:", e);
    return null;
  }
}

// Handle new connections
wss.on('connection', function connection(ws, request) {
  // Parse URL and extract token
  const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
  const token = url.searchParams.get('token') || "";
  const userId = checkUser(token);
  
  // Close connection if user validation fails
  if (userId === null) {
    console.log("Authentication failed, closing connection");
    ws.close(1008, "Authentication failed");
    return;
  }
  
  console.log(`User ${userId} connected`);
  
  // Add user to active users list
  const user: User = { userId, rooms: [], ws };
  users.push(user);
  
  // Handle messages from client
  ws.on('message', async function message(data) {
    let parsedData;
    
    try {
      if (typeof data !== "string") {
        parsedData = JSON.parse(data.toString());
      } else {
        parsedData = JSON.parse(data);
      }
      
      console.log("Message received:", parsedData);
      
      // Handle joining rooms
      if (parsedData.type === "join_room") {
        const roomId = parsedData.roomId.toString();
        const user = users.find(x => x.ws === ws);
        
        if (user && !user.rooms.includes(roomId)) {
          user.rooms.push(roomId);
          console.log(`User ${userId} joined room ${roomId}`);
          
          // Acknowledge the join
          ws.send(JSON.stringify({
            type: "room_joined",
            roomId
          }));
        }
      }
      
      // Handle leaving rooms
      if (parsedData.type === "leave_room") {
        const roomId = parsedData.roomId.toString();
        const user = users.find(x => x.ws === ws);
        
        if (user) {
          user.rooms = user.rooms.filter(x => x !== roomId);
          console.log(`User ${userId} left room ${roomId}`);
        }
      }
      
      // Handle chat messages
      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId.toString();
        const message = parsedData.message;
        
        if (!message || !roomId) {
          console.log("Invalid chat message format");
          return;
        }
        
        // Save message to database
        await prismaClient.chat.create({
          data: {
            roomId: Number(roomId),
            message,
            userId
          }
        });
        
        console.log(`Broadcasting message to room ${roomId}`);
        
        // Broadcast to all users in the room
        users.forEach(user => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(JSON.stringify({
              type: "chat",
              message: message,
              roomId,
              userId: userId, // Include sender's userId
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({
        type: "error",
        message: "Failed to process message"
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log(`User ${userId} disconnected`);
    const index = users.findIndex(user => user.userId === userId);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });
  
  // Send initial connection success message
  ws.send(JSON.stringify({
    type: "connected",
    userId
  }));
});

console.log("WebSocket server running on port 8080");