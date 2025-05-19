import { HTTP_BACKEND } from "@/config";
import axios from "axios";



export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {


    const ctx = canvas.getContext("2d");

    let existingShape: Shape[] = await getExistingShapes(roomId);
    if (!ctx) {
        return;
    }

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type == "chat") {
            const parsedShape = JSON.parse(message.message)
            existingShape.push(parsedShape.shape)
            clearCanvas(existingShape, canvas, ctx)
        }

    }

    clearCanvas(existingShape, canvas, ctx)

    let clicked = false
    let startX = 0
    let startY = 0
    

    
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    
    })
}

