import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const input = await req.json();

    const prompt = `
You are the identity engine for MillionaireOS.

Generate ONE identity sentence based on the user's real behavior.

User context:
${JSON.stringify(input, null, 2)}

Rules:
- Start with "You are becoming"
- Maximum 22 words
- Use actual behavior, not generic motivation
- Mention their strongest pattern if clear
- Mention rebuilding if scores or habits are weak
- Premium, direct, powerful tone
- No emojis
- No quotation marks
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You generate concise identity statements from habit, finance, fitness, mindset and goal data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 80,
        temperature: 0.75,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      identity:
        data.choices?.[0]?.message?.content?.trim() ||
        "You are becoming a disciplined builder of your future.",
    });
  } catch {
    return NextResponse.json({
      identity: "You are becoming a disciplined builder of your future.",
    });
  }
}