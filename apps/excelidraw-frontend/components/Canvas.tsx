import { initDraw } from "@/draw"
import { useEffect, useRef } from "react"

export function Canvas({roomId,socket}:{roomId:string,socket:WebSocket}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, roomId,socket)
        }

    }, [canvasRef])
    return <div>
        <canvas ref={canvasRef} width={2000} height={2000}>

        </canvas>
        return
        <div className="fixed bottom-0 right-0">
            <div className="bg-white text-black">Rect</div>
            <div className="bg-white text-black">Circle</div>

        </div>
    </div>
}