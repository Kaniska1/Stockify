import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  User,
  AlertCircle,
  BriefcaseBusiness,
  Scale,
  BookOpen,
  ShieldAlert,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import {
  sendAIMessage,
  type AIChatMessage,
} from "../lib/ai";

interface DisplayMessage extends AIChatMessage {
  id: string;
}

const SUGGESTED_PROMPTS = [
  {
    title: "Analyze my portfolio",
    description:
      "Review concentration, diversification and major risks.",
    prompt:
      "Analyze my current portfolio and explain its concentration risks, strengths, and possible diversification improvements.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Compare two stocks",
    description:
      "Compare business quality, risk and potential.",
    prompt:
      "Compare Apple and Microsoft using the information available in Stockify. Explain the strengths, risks and differences.",
    icon: Scale,
  },
  {
    title: "Explain an investing term",
    description:
      "Learn concepts without the financial jargon soup.",
    prompt:
      "Explain the price-to-earnings ratio in simple terms, including its limitations and an example.",
    icon: BookOpen,
  },
  {
    title: "Assess my risk",
    description:
      "Understand what could hurt your portfolio.",
    prompt:
      "Evaluate the overall risk of my Stockify portfolio and identify the three most important risks.",
    icon: ShieldAlert,
  },
];

function createMessage(
  role: "user" | "assistant",
  content: string
): DisplayMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

export default function AIAssistantPage() {
  const { token, user } = useAuth();

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();

    if (!message || sending) return;

    if (!token) {
      toast.error("You must be logged in to use Stockify AI.");
      return;
    }

    const userMessage = createMessage("user", message);

    const previousHistory: AIChatMessage[] = messages.map(
      ({ role, content }) => ({
        role,
        content,
      })
    );

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setSending(true);

    try {
      const response = await sendAIMessage(
        token,
        message,
        previousHistory
      );

      const assistantMessage = createMessage(
        "assistant",
        response.answer
      );

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Stockify AI could not respond"
      );
    } finally {
      setSending(false);

      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await sendMessage(input);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  };

  return (
    <div className="p-6 h-full">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "rgba(246,246,9,0.1)",
                  border:
                    "1px solid rgba(246,246,9,0.2)",
                }}
              >
                <Sparkles
                  size={18}
                  style={{ color: "#f6f609" }}
                />
              </div>

              <div>
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#e7fef6",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Stockify AI
                </h1>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#808080",
                    marginTop: "1px",
                  }}
                >
                  Portfolio insights and investing education
                </p>
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              disabled={sending}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333333",
                color: "#999999",
                fontSize: "12px",
                cursor: sending
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              <Trash2 size={14} />
              Clear conversation
            </button>
          )}
        </div>

        {/* Disclaimer */}
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4"
          style={{
            background:
              "rgba(245,158,11,0.06)",
            border:
              "1px solid rgba(245,158,11,0.16)",
          }}
        >
          <AlertCircle
            size={15}
            className="mt-0.5 flex-shrink-0"
            style={{ color: "#f59e0b" }}
          />

          <p
            style={{
              fontSize: "11px",
              color: "#a3a3a3",
              lineHeight: 1.6,
            }}
          >
            Stockify AI provides educational analysis, not
            financial advice. Current Stockify prices are
            simulated and may not reflect real market prices.
          </p>
        </div>

        {/* Chat panel */}
        <div
          className="flex-1 min-h-[520px] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "#151515",
            border: "1px solid #333333",
          }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(246,246,9,0.16), rgba(197,197,7,0.07))",
                    border:
                      "1px solid rgba(246,246,9,0.2)",
                  }}
                >
                  <Bot
                    size={27}
                    style={{ color: "#f6f609" }}
                  />
                </div>

                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 650,
                    color: "#e7fef6",
                  }}
                >
                  What would you like to explore
                  {user?.name
                    ? `, ${user.name.split(" ")[0]}`
                    : ""}
                  ?
                </h2>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#808080",
                    marginTop: "6px",
                    textAlign: "center",
                    maxWidth: "500px",
                    lineHeight: 1.6,
                  }}
                >
                  Ask about your portfolio, investing concepts,
                  diversification, risks, or stocks available in
                  Stockify.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mt-7 w-full max-w-2xl">
                  {SUGGESTED_PROMPTS.map(
                    ({
                      title,
                      description,
                      prompt,
                      icon: Icon,
                    }) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() =>
                          void sendMessage(prompt)
                        }
                        className="p-4 rounded-xl text-left transition-all"
                        style={{
                          background: "#1a1a1a",
                          border:
                            "1px solid #333333",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.borderColor =
                            "rgba(246,246,9,0.35)";
                          event.currentTarget.style.background =
                            "rgba(246,246,9,0.025)";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.borderColor =
                            "#333333";
                          event.currentTarget.style.background =
                            "#1a1a1a";
                        }}
                      >
                        <Icon
                          size={16}
                          style={{
                            color: "#f6f609",
                            marginBottom: "9px",
                          }}
                        />

                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#e7fef6",
                          }}
                        >
                          {title}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#808080",
                            marginTop: "4px",
                            lineHeight: 1.5,
                          }}
                        >
                          {description}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((message) => {
                  const isUser =
                    message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background:
                              "rgba(246,246,9,0.1)",
                            border:
                              "1px solid rgba(246,246,9,0.16)",
                          }}
                        >
                          <Bot
                            size={15}
                            style={{
                              color: "#f6f609",
                            }}
                          />
                        </div>
                      )}

                      <div
                        className="max-w-[85%] rounded-2xl px-4 py-3"
                        style={{
                          background: isUser
                            ? "linear-gradient(135deg, #f6f609, #c5c507)"
                            : "#1e1e1e",

                          border: isUser
                            ? "none"
                            : "1px solid #333333",

                          color: isUser
                            ? "#111111"
                            : "#d4d4d4",

                          borderBottomRightRadius:
                            isUser ? "5px" : "16px",

                          borderBottomLeftRadius:
                            isUser ? "16px" : "5px",
                        }}
                      >
                        {isUser ? (
                          <p
                            style={{
                              fontSize: "13px",
                              lineHeight: 1.65,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {message.content}
                          </p>
                        ) : (
                          <div
                            className="ai-response"
                            style={{
                              fontSize: "13px",
                              lineHeight: 1.7,
                            }}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => (
                                  <h1
                                    style={{
                                      color: "#e7fef6",
                                      fontSize: "18px",
                                      fontWeight: 700,
                                      margin:
                                        "10px 0 7px",
                                    }}
                                  >
                                    {children}
                                  </h1>
                                ),

                                h2: ({ children }) => (
                                  <h2
                                    style={{
                                      color: "#e7fef6",
                                      fontSize: "16px",
                                      fontWeight: 650,
                                      margin:
                                        "14px 0 6px",
                                    }}
                                  >
                                    {children}
                                  </h2>
                                ),

                                h3: ({ children }) => (
                                  <h3
                                    style={{
                                      color: "#e7fef6",
                                      fontSize: "14px",
                                      fontWeight: 650,
                                      margin:
                                        "12px 0 5px",
                                    }}
                                  >
                                    {children}
                                  </h3>
                                ),

                                p: ({ children }) => (
                                  <p
                                    style={{
                                      margin: "6px 0",
                                    }}
                                  >
                                    {children}
                                  </p>
                                ),

                                ul: ({ children }) => (
                                  <ul
                                    style={{
                                      paddingLeft: "20px",
                                      margin: "7px 0",
                                      listStyle: "disc",
                                    }}
                                  >
                                    {children}
                                  </ul>
                                ),

                                ol: ({ children }) => (
                                  <ol
                                    style={{
                                      paddingLeft: "20px",
                                      margin: "7px 0",
                                      listStyle: "decimal",
                                    }}
                                  >
                                    {children}
                                  </ol>
                                ),

                                li: ({ children }) => (
                                  <li
                                    style={{
                                      margin: "4px 0",
                                    }}
                                  >
                                    {children}
                                  </li>
                                ),

                                strong: ({ children }) => (
                                  <strong
                                    style={{
                                      color: "#e7fef6",
                                      fontWeight: 650,
                                    }}
                                  >
                                    {children}
                                  </strong>
                                ),

                                code: ({ children }) => (
                                  <code
                                    style={{
                                      padding:
                                        "2px 5px",
                                      borderRadius: "5px",
                                      background:
                                        "#111111",
                                      color: "#f8f83a",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {children}
                                  </code>
                                ),

                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-3">
                                    <table
                                      style={{
                                        width: "100%",
                                        borderCollapse:
                                          "collapse",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {children}
                                    </table>
                                  </div>
                                ),

                                th: ({ children }) => (
                                  <th
                                    style={{
                                      padding:
                                        "8px 10px",
                                      textAlign: "left",
                                      border:
                                        "1px solid #3a3a3a",
                                      color: "#e7fef6",
                                      background:
                                        "#181818",
                                    }}
                                  >
                                    {children}
                                  </th>
                                ),

                                td: ({ children }) => (
                                  <td
                                    style={{
                                      padding:
                                        "8px 10px",
                                      border:
                                        "1px solid #333333",
                                    }}
                                  >
                                    {children}
                                  </td>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "#272727",
                            border:
                              "1px solid #383838",
                          }}
                        >
                          <User
                            size={15}
                            style={{
                              color: "#b3b3b3",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {sending && (
                  <div className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "rgba(246,246,9,0.1)",
                        border:
                          "1px solid rgba(246,246,9,0.16)",
                      }}
                    >
                      <Bot
                        size={15}
                        style={{
                          color: "#f6f609",
                        }}
                      />
                    </div>

                    <div
                      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
                      style={{
                        background: "#1e1e1e",
                        border: "1px solid #333333",
                        borderBottomLeftRadius: "5px",
                      }}
                    >
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{
                            background: "#f6f609",
                            animationDelay: `${index * 120}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="p-4"
            style={{
              borderTop: "1px solid #333333",
              background: "#171717",
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-3"
            >
              <div
                className="flex-1 rounded-xl overflow-hidden"
                style={{
                  background: "#0d0d0d",
                  border: "1px solid #333333",
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your portfolio, stocks or investing..."
                  rows={1}
                  maxLength={4000}
                  disabled={sending}
                  className="w-full resize-none outline-none px-4 pt-3 pb-2"
                  style={{
                    minHeight: "48px",
                    maxHeight: "150px",
                    background: "transparent",
                    color: "#e7fef6",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                />

                <div className="flex items-center justify-between px-4 pb-2">
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#4d4d4d",
                    }}
                  >
                    Enter to send · Shift + Enter for a new line
                  </span>

                  <span
                    style={{
                      fontSize: "10px",
                      color:
                        input.length > 3800
                          ? "#f59e0b"
                          : "#4d4d4d",
                    }}
                  >
                    {input.length}/4000
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background:
                    !input.trim() || sending
                      ? "#333333"
                      : "linear-gradient(135deg, #f6f609, #c5c507)",

                  color:
                    !input.trim() || sending
                      ? "#5f5f5f"
                      : "#111111",

                  cursor:
                    !input.trim() || sending
                      ? "not-allowed"
                      : "pointer",
                }}
                title="Send message"
              >
                {sending ? (
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{
                      borderColor:
                        "rgba(255,255,255,0.25)",
                      borderTopColor:
                        "#ffffff",
                    }}
                  />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}