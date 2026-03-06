const { OpenRouter } = require("@openrouter/sdk");

async function main() {
  const openrouter = new OpenRouter({ apiKey: "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" });
  
  try {
    const stream = await openrouter.chat.send({
      chatGenerationParams: {
        model: "stepfun/step-3.5-flash:free",
        response_format: { type: "json_object" },
        messages: [
          { role: "user", content: "Say {\"test\": 123} as JSON" }
        ],
        stream: true
      }
    });

    if (!stream.isOk()) {
      console.log("Not Ok:", stream.error());
      return;
    }

    let content = "";
    for await (const chunk of stream.value()) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        content += delta;
      }
    }
    
    console.log("Returned content:", content);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
