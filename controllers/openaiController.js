import fetch from "node-fetch";

export const handleOpenAIRequest = async (req, res) => {
  const { prompt, history } = req.body;

  const fullPrompt = `
    최근 대화 요약:
    ${history.join("\n")}
    
    다음 질문에 대해 대답해주세요: ${prompt}
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: fullPrompt }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API 호출 오류:", error);
    res
      .status(500)
      .json({ error: "Could not fetch response from OpenAI API." });
  }
};
