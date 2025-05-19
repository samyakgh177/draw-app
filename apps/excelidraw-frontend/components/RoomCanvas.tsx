"use client"
import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react"
import { Canvas } from "./Canvas";
export function RoomCanvas({ roomId }: { roomId: string }) {

    const [socket,setSocket] = useState<WebSocket | null>(null);

    //this should be in the hook for connection with the hook
    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYmM1ZGI5Ni1lMGZiLTRkYmEtOWE2NS1lNTgxMTk5YmYzMTMiLCJpYXQiOjE3NDc0MTkzNjd9.tm4Wo992_14RrzIM8Gwb7gcUA8D8R3NoMGVK6SU5yEQ`)

        ws.onopen= ()=>{
            setSocket(ws);
            ws.send(JSON.stringify({
                type:"join_room",
                roomId:roomId
            }))
        }
    },[])

   

    if(!socket){
        return <div>
            connecting to server......
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket}/>
    </div>
}