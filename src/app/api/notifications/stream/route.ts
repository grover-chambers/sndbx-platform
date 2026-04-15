import { NextRequest } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`))
      
      // Set up interval to send heartbeat (keeps connection alive)
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`))
      }, 30000)
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
