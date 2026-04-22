import { openai } from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { notes } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free", // model served by OpenRouter
      messages: [
        {
          role: "system",
          content: JSON.stringify(AIDoctorAgents),
        },
        {
          role: "user",
          content: `User Notes/Symptoms: ${notes}. Based on the user notes and symptoms, please suggest a list of doctors. For each doctor, return a JSON object with the following fields: id, specialist, agentPrompt, description, image (URL). Return only valid JSON.`,
        },
      ],
    });

    const rawResp = completion.choices[0].message?.content || "";

    // 🧼 Clean response: Remove any ```json or ``` wrappers
    const cleaned = rawResp
      .trim()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🧪 Try to parse the cleaned JSON
    const jsonResp = JSON.parse(cleaned);

    return NextResponse.json(jsonResp);
  } catch (e) {
    console.error("LLM error:", e);

    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Unexpected error",
      },
      { status: 500 }
    );
  }
}
