import { BaseMessage, HumanMessage } from "langchain/schema"

export const parseLangchainMessages = (messages: BaseMessage[]) => {
  const parsed = messages.map((message: BaseMessage) => {
    const parsedMessage = {
      role: message instanceof HumanMessage ? 'user' : 'assistant',
      content: message.content
    }
    return parsedMessage
  })

  return parsed
}