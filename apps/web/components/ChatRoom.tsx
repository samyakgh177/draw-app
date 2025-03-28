"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../app/config";
import { ChatRoomClient } from "./ChatRoomClient";

export function ChatRoom({ id }: { id: string }) {
    const [messages, setMessages] = useState<{ message: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchChats() {
            try {
                const response = await axios.get(`${BACKEND_URL}/chats/${id}`);
                setMessages(response.data.message);
            } catch (error) {
                console.error("Failed to fetch chats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchChats();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    return <ChatRoomClient id={id} message={messages} />;
}