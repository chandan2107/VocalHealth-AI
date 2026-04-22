import connectToDatabase from "@/config/mongodb";
import { openai } from "@/config/OpenAiModel";
import SessionChat from "@/models/SessionChat";
import { NextRequest, NextResponse } from "next/server";

const REPORT_GEN_PROMPT=`
You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on doctor AI agent info and Conversation between AI medical agent and user, generate a structured report with the following fields:
sessionId: a unique session identifier
agent: the medical specialist name (e.g., "General Physician AI")
user: name of the patient or "Anonymous" if not provided
timestamp: current date and time in ISO format
chiefComplaint: one-sentence summary of the main health concern
summary: a 2-3 sentence summary of the conversation, symptoms, and recommendations
symptoms: list of symptoms mentioned by the user
duration: how long the user has experienced the symptoms
severity: mild, moderate, or severe
medicationsMentioned: list of any medicines mentioned
recommendations: list of AI suggestions (e.g., rest, see a doctor)
Return the result in this JSON format:
{
 "sessionId": "string",
 "agent": "string",
 "user": "string",
 "timestamp": "ISO Date string",
 "chiefComplaint": "string",
 "summary": "string",
 "symptoms": ["symptom1", "symptom2"],
 "duration": "string",
 "severity": "string",
 "medicationsMentioned": ["med1", "med2"],
 "recommendations": ["rec1", "rec2"],
}
Only include valid fields. Respond with nothing else.

`
export async function POST(req :NextRequest) {
    const {sessionId,sessionDetail,message} = await req.json();

    try{
        await connectToDatabase();
        const UserInput="AI Doctor agent Info:"+JSON.stringify(sessionDetail)+", Conversation:"+JSON.stringify(message);
        const completion = await openai.chat.completions.create({
              model: "openai/gpt-oss-20b:free", // model served by OpenRouter
              messages: [
                {
                  role: "system",
                  content:REPORT_GEN_PROMPT,
                },
                {
                  role: "user",
                  content:UserInput,
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


            const result = await SessionChat.findOneAndUpdate(
                { sessionId: sessionId },
                {
                    report: jsonResp,
                    conversation: message
                },
                { new: true }
            );

            return NextResponse.json(jsonResp);

    }catch(e: any){
        console.error("POST medical-report ERROR:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}