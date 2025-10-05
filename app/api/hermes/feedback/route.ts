export async function POST(req: Request) {
  try {
    const { messageId, feedback, timestamp } = await req.json()

    console.log("[v0] Hermes AI feedback received:", {
      messageId,
      feedback,
      timestamp,
    })

    // This is where you would save the feedback to track user satisfaction
    // Example: await db.insert('feedback', { messageId, feedback, timestamp })

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Hermes AI feedback error:", error)
    return Response.json({ error: "Failed to save feedback" }, { status: 500 })
  }
}
