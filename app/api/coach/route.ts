export async function POST(req: Request) {
  const { goal, category } = await req.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an elite millionaire performance coach. Be direct, practical and concise.",
        },
        {
          role: "user",
          content: `Goal: ${goal}
Category: ${category}

Give:
1. 5 habits to build
2. 5 mindset shifts
3. 3 weekly actions
4. 1 non-negotiable action today
Keep it practical.`,
        },
      ],
    }),
  });

  const data = await response.json();

  return Response.json({
    result: data.choices?.[0]?.message?.content || "Could not generate plan.",
  });
}
