import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const API_KEY = "";
const systemMessage = {
  role: "system",
  content:
    "Correct the spelling and grammatical errors in the following text:\n\n",
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };
  const userPrompt =
    "Correct the spelling and grammatical errors in the following text:\n\n";
  const userPrompts = "comment on the above passage:\n\n";
  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return {
        role: role,
        content: userPrompt + messageObject.message + userPrompts,
      };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo-0613",
      messages: [systemMessage, ...apiMessages],
      functions: [
        {
          name: "makeCorrections",
          description:
            "Make spelling or grammar corrections to text content and provide general comments",
          parameters: {
            type: "object",
            properties: {
              replacements: {
                type: "array",
                description: "Array of corrections",
                items: {
                  type: "object",
                  properties: {
                    changeFrom: {
                      type: "string",
                      description: "The word or phrase to change",
                    },
                    changeTo: {
                      type: "string",
                      description: "The new word or phrase to replace it with",
                    },
                    reason: {
                      type: "string",
                      description: "The reason this change is being made",
                      enum: ["Grammar", "Spelling"],
                    },
                    comment: {
                      type: "string",
                      description: "Kiểm tra và nhận xét đoạn văn trên",
                      language: ["vi"],
                    },
                  },
                },
              },
            },
          },
        },
      ],
      function_call: { name: "makeCorrections" },
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        const [responseChoice] = data.choices;
        console.log(responseChoice);
        setMessages([
          ...chatMessages,
          {
            message: responseChoice.message.function_call.arguments,
            sender: "ChatGPT",
          },
        ]);
        setIsTyping(false);
      });
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="ChatGPT is typing" />
                ) : null
              }
            >
              {messages.map((message, i) => {
                // console.log(message);
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
