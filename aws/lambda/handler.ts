import type { Handler, Context } from "aws-lambda"

interface BackgroundJobEvent {
  type: "embedding-generation" | "data-sync" | "listing-update"
  payload?: Record<string, unknown>
}

export const handler: Handler<BackgroundJobEvent> = async (
  event: BackgroundJobEvent,
  context: Context
) => {
  console.log("Background job received:", JSON.stringify(event))
  console.log("Request ID:", context.awsRequestId)

  switch (event.type) {
    case "embedding-generation":
      // Phase 4: OpenAI text-embedding-3-small -> pgvector
      return { statusCode: 200, body: "Embedding generation not yet implemented" }

    case "data-sync":
      // Phase 5: Attom Data API polling -> market_snapshots
      return { statusCode: 200, body: "Data sync not yet implemented" }

    case "listing-update":
      // Phase 2: SimplyRETS IDX sync -> listings table
      return { statusCode: 200, body: "Listing update not yet implemented" }

    default:
      return { statusCode: 400, body: `Unknown job type: ${(event as BackgroundJobEvent).type}` }
  }
}
