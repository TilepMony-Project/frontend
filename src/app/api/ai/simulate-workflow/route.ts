import { PrivyUnauthorizedError, requirePrivySession } from "@/lib/auth/privy";
import { type NextRequest, NextResponse } from "next/server";
import { generateSimulationPrompt } from "./prompts";

const SUMOPOD_API_URL = "https://ai.sumopod.com/v1/chat/completions";
const SUMOPOD_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requirePrivySession(request);
    const body = await request.json();
    const { workflow, targetedNodes } = body;

    if (!workflow || !targetedNodes) {
      return NextResponse.json(
        { error: "Workflow and targetedNodes are required" },
        { status: 400 }
      );
    }

    const systemPrompt = generateSimulationPrompt(targetedNodes, workflow);

    const response = await fetch(SUMOPOD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUMOPOD_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: "Explain the money flow for this workflow simulation in detail.",
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    const completion = await response.json();
    const explanation = completion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (error: any) {
    if (error instanceof PrivyUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Simulation explanation error:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
