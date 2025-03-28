"use client"
import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react"
import { Canvas } from "./Canvas";
export function RoomCanvas({ roomId }: { roomId: string }) {

    const [socket,setSocket] = useState<WebSocket | null>(null);

    //this should be in the hook for connection with the hook
    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlNDFhMDY4Zi0zZTdhLTQxNzYtOWQ2MC04YjEwMDJlMWM3NWYiLCJpYXQiOjE3NDMxODMyNzZ9.IXdMT2FmWgqVjWxM3sR30N43Uao2WB5u9uVzvI5FcYQ`)

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