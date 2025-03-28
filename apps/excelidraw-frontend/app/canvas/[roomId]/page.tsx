
import { RoomCanvas } from "@/components/RoomCanvas";
import { initDraw } from "@/draw";


export default async function CanvasPage({params}:{
    params:{
        roomId:string
    }
}){
    const roomId = (await params).roomId


    return <RoomCanvas roomId={roomId}/>

}