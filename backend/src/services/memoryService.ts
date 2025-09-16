import { IMessage } from "../models/Message";
import { generativeModel } from "../llm";

function formatMessagesForSummary(messages: IMessage[]): string {
  return messages.map(message => {
    if (message.sender === 'user') {
      return `User: ${message.text}`;
    } else {
      try {
        const commands = JSON.parse(message.text);
        const spokenTexts = commands
          .filter((cmd: any) => cmd.command === 'speak' && cmd.payload && cmd.payload.text)
          .map((cmd: any) => cmd.payload.text);
        return `AI: ${spokenTexts.join(' ')}`;
      } catch (error) {
        return `AI: (Response cannot be processed)`;
      }
    }
  }).join('\n');
}

/**
 * Summarizes a conversation history using the generative model.
 * @param messages The array of messages to summarize.
 * @returns A promise that resolves with the summary text.
 */
export const summarizeConversation = async (messages: IMessage[]): Promise<string> => {
  if (messages.length === 0) {
    return "";
  }

  const historyText = formatMessagesForSummary(messages);
  const prompt = `Summarize the following conversation into a concise paragraph. Capture the main topics and key conclusions. The summary will be used as context for an ongoing conversation, so be brief and informative.

---
${historyText}
---

Summary:`

  try {
    const result = await generativeModel.generateContent(prompt);
    const summary = result.response.text();
    console.log(`[MemoryService] Generated summary: "${summary}"`);
    return summary;
  } catch (error) {
    console.error("[MemoryService] Error generating conversation summary:", error);
    return ""; // Return empty string on error to not break the flow
  }
};

