"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";



export default function Home() {
  const [roomId,setRoomId] = useState("");
  const router = useRouter();

  return (
    <div style={{
      display: "flex",
      justifyContent:"center",
      alignItems:"center",
      height:"100vh",
      width:"100vw",
      flexDirection:"column"

    }
      }>
      <input style={{
        padding:"10px",
      }} value={roomId} onChange={(e)=>{
        setRoomId(e.target.value)
      }} placeholder="Room id" type="text"    
      ></input>
      <button style={{
        padding:10
      }} 
       onClick={()=>{
        router.push(`/room/${roomId}`)
      }}>Join Room</button>
    </div>
  )
}
