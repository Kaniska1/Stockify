import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { getStockLogo } from "../lib/getStockLogo";
import {
  AlertCircle,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Brain,
  Scale,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
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

interface SuggestedPrompt {
  title: string;
  description: string;
  prompt: string;
  icon: typeof BriefcaseBusiness;
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
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
      "Compare business quality, uncertainty and risk.",
    prompt:
      "Compare Apple and Microsoft using the information available in Stockify. Explain their strengths, risks and key differences.",
    icon: Scale,
  },
  {
    title: "Explain an investing term",
    description:
      "Learn concepts without drowning in financial jargon.",
    prompt:
      "Explain the price-to-earnings ratio in simple terms, including its limitations and an example.",
    icon: BookOpen,
  },
  {
    title: "Assess my risk",
    description:
      "Identify the factors that could hurt your portfolio.",
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

  const [messages, setMessages] = useState<
    DisplayMessage[]
  >([]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const sendMessage = async (
    rawMessage: string
  ) => {
    const message = rawMessage.trim();

    if (!message || sending) {
      return;
    }

    if (!token) {
      toast.error(
        "You must be logged in to use Stockify AI."
      );

      return;
    }

    const previousHistory: AIChatMessage[] =
      messages.map(
        ({ role, content }) => ({
          role,
          content,
        })
      );

    const userMessage = createMessage(
      "user",
      message
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

      const assistantMessage =
        createMessage(
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

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const firstName =
    user?.name?.split(" ")[0] ?? "Investor";

  return (
    <div className="ai-assistant-page">
      <section className="ai-assistant-heading">
        <div>
          <span className="ai-assistant-eyebrow">
            STOCKIFY INTELLIGENCE
          </span>

          <h1>AI Research Assistant</h1>

          <p>
            Explore your portfolio, understand
            investment concepts and identify
            risks using personalized AI analysis.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            className="ai-clear-button"
            onClick={clearConversation}
            disabled={sending}
          >
            <Trash2 size={14} />
            Clear conversation
          </button>
        )}
      </section>

      <section className="ai-capability-strip">
        <article>
          <span className="ai-capability-icon">
            <BriefcaseBusiness size={17} />
          </span>

          <div>
            <strong>
              Portfolio-aware
            </strong>

            <small>
              Uses your holdings, cash and recent
              transactions.
            </small>
          </div>
        </article>

        <article>
          <span className="ai-capability-icon">
            <Brain size={17} />
          </span>

          <div>
            <strong>
              Contextual research
            </strong>

            <small>
              Remembers the current conversation
              for follow-up questions.
            </small>
          </div>
        </article>

        <article>
          <span className="ai-capability-icon">
            <ShieldAlert size={17} />
          </span>

          <div>
            <strong>
              Risk-conscious
            </strong>

            <small>
              Avoids guarantees and clearly states
              uncertainty.
            </small>
          </div>
        </article>
      </section>

      <section className="ai-disclaimer-banner">
        <AlertCircle size={15} />

        <p>
          Stockify AI provides educational
          analysis, not financial advice. Market
          information may be incomplete, delayed or
          simulated depending on the feature being
          discussed.
        </p>
      </section>

      <section className="ai-workspace">
        <header className="ai-workspace-header">
          <div className="ai-agent-identity">
            <span className="ai-agent-logo">
              <Sparkles size={17} />
            </span>

            <div>
              <strong>Stockify AI</strong>

              <span>
                Powered by Google Gemini
              </span>
            </div>
          </div>

          <div className="ai-agent-status">
            <span />
            Ready
          </div>
        </header>

        <div className="ai-messages">
          {messages.length === 0 ? (
            <div className="ai-welcome-state">
              <div className="ai-welcome-icon">
                <Bot size={28} />
              </div>

              <span className="ai-welcome-label">
                PERSONALIZED RESEARCH
              </span>

              <h2>
                What would you like to explore,
                {` ${firstName}`}?
              </h2>

              <p>
                Ask about your portfolio,
                diversification, risk, recent
                transactions or an investing
                concept.
              </p>

              <div className="ai-prompt-grid">
                {SUGGESTED_PROMPTS.map(
                  ({
                    title,
                    description,
                    prompt,
                    icon: Icon,
                  }) => (
                    <button
                      type="button"
                      key={title}
                      className="ai-prompt-card"
                      onClick={() =>
                        void sendMessage(prompt)
                      }
                      disabled={sending}
                    >
                      <span className="ai-prompt-icon">
                        <Icon size={16} />
                      </span>

                      <strong>{title}</strong>

                      <small>
                        {description}
                      </small>
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="ai-conversation">
              {messages.map((message) => {
                const isUser =
                  message.role === "user";

                return (
                  <article
                    key={message.id}
                    className={`ai-message-row ${
                      isUser
                        ? "ai-message-user"
                        : "ai-message-assistant"
                    }`}
                  >
                    {!isUser && (
                      <span className="ai-message-avatar ai-bot-avatar">
                        <Bot size={15} />
                      </span>
                    )}

                    <div className="ai-message-content">
                      <span className="ai-message-author">
                        {isUser
                          ? "You"
                          : "Stockify AI"}
                      </span>

                      <div className="ai-message-bubble">
                        {isUser ? (
                          <p className="ai-user-text">
                            {message.content}
                          </p>
                        ) : (
                          <div className="ai-markdown">
                            <ReactMarkdown
                              remarkPlugins={[
                                remarkGfm,
                              ]}
                              components={{
                                h1: ({
                                  children,
                                }) => (
                                  <h1>
                                    {children}
                                  </h1>
                                ),

                                h2: ({
                                  children,
                                }) => (
                                  <h2>
                                    {children}
                                  </h2>
                                ),

                                h3: ({
                                  children,
                                }) => (
                                  <h3>
                                    {children}
                                  </h3>
                                ),

                                p: ({
                                  children,
                                }) => (
                                  <p>
                                    {children}
                                  </p>
                                ),

                                ul: ({
                                  children,
                                }) => (
                                  <ul>
                                    {children}
                                  </ul>
                                ),

                                ol: ({
                                  children,
                                }) => (
                                  <ol>
                                    {children}
                                  </ol>
                                ),

                                li: ({
                                  children,
                                }) => (
                                  <li>
                                    {children}
                                  </li>
                                ),

                                strong: ({
                                  children,
                                }) => (
                                  <strong>
                                    {children}
                                  </strong>
                                ),

                                blockquote: ({
                                  children,
                                }) => (
                                  <blockquote>
                                    {children}
                                  </blockquote>
                                ),

                                code: ({
                                  children,
                                  className,
                                }) => {
                                  const isBlock =
                                    Boolean(
                                      className
                                    );

                                  return isBlock ? (
                                    <code
                                      className={
                                        className
                                      }
                                    >
                                      {children}
                                    </code>
                                  ) : (
                                    <code className="ai-inline-code">
                                      {children}
                                    </code>
                                  );
                                },

                                pre: ({
                                  children,
                                }) => (
                                  <pre>
                                    {children}
                                  </pre>
                                ),

                                table: ({
                                  children,
                                }) => (
                                  <div className="ai-table-scroll">
                                    <table>
                                      {children}
                                    </table>
                                  </div>
                                ),

                                th: ({
                                  children,
                                }) => (
                                  <th>
                                    {children}
                                  </th>
                                ),

                                td: ({
                                  children,
                                }) => (
                                  <td>
                                    {children}
                                  </td>
                                ),

                                a: ({
                                  children,
                                  href,
                                }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <span className="ai-message-avatar ai-user-avatar">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                          />
                        ) : (
                          <User size={15} />
                        )}
                      </span>
                    )}
                  </article>
                );
              })}

              {sending && (
                <article className="ai-message-row ai-message-assistant">
                  <span className="ai-message-avatar ai-bot-avatar">
                    <Bot size={15} />
                  </span>

                  <div className="ai-message-content">
                    <span className="ai-message-author">
                      Stockify AI
                    </span>

                    <div className="ai-message-bubble ai-thinking-bubble">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </article>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="ai-composer-wrap">
          <form
            className="ai-composer"
            onSubmit={handleSubmit}
          >
            <div className="ai-composer-input">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask about your portfolio, stocks, risk or investing..."
                rows={1}
                maxLength={4000}
                disabled={sending}
              />

              <div className="ai-composer-meta">
                <span>
                  Enter to send · Shift + Enter for
                  a new line
                </span>

                <span
                  className={
                    input.length > 3800
                      ? "ai-character-warning"
                      : ""
                  }
                >
                  {input.length}/4000
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="ai-send-button"
              disabled={
                !input.trim() || sending
              }
              aria-label="Send message"
              title="Send message"
            >
              {sending ? (
                <span className="ai-send-spinner" />
              ) : (
                <Send size={17} />
              )}
            </button>
          </form>

          <p className="ai-composer-disclaimer">
            AI responses may contain errors. Verify
            important information before making
            decisions.
          </p>
        </footer>
      </section>
    </div>
  );
}