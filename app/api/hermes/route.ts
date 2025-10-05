export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json()

    // This is a placeholder response structure
    // You should integrate with your own backend/AI service here

    console.log("[v0] Hermes AI received message:", message)
    console.log("[v0] Message history:", history)

    // Placeholder response - replace with your actual API call
    const response = {
      response: `Recebi sua pergunta: "${message}"\n\nEsta é uma resposta de exemplo. Por favor, integre sua própria API aqui para processar perguntas e consultar o banco de dados IoT.\n\nO Hermes está pronto para transformar suas perguntas em insights valiosos sobre suas máquinas industriais.`,
      timestamp: new Date().toISOString(),
    }

    return Response.json(response)
  } catch (error) {
    console.error("[v0] Hermes AI error:", error)
    return Response.json({ error: "Failed to process message" }, { status: 500 })
  }
}
