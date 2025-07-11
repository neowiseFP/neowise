import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { v4 as uuidv4 } from "uuid";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type Session = {
  id: string;
  title: string;
  updated_at: string;
};

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Hi, I’m Neo — your AI financial assistant, backed by a human CFP®. Ask me anything to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ [index: number]: string }>({});
  const [suggested, setSuggested] = useState<string[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCFP, setShowCFP] = useState(false);
  const [showInvestmentCheck, setShowInvestmentCheck] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scrollOnNextMessage, setScrollOnNextMessage] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const categories = {
    "Getting Started": [
      "What’s a Roth IRA?",
      "What are the most common financial mistakes?",
      "How do I build a financial plan?",
      "What should I do with extra cash?",
    ],
    "Having a Family": [
      "How do 529 college savings plans work?",
      "Should I open a custodial Roth IRA?",
      "How do I update my beneficiaries?",
      "How much life insurance should I consider?",
    ],
    Housing: [
      "How much house can I afford?",
      "What’s a good down payment?",
      "Should I use a 15 or 30 year mortgage?",
      "How do mortgage points work?",
    ],
    "Retirement Planning": [
      "How much do I need to retire?",
      "Should I pay off my mortgage before retiring?",
      "What’s a sustainable withdrawal rate?",
      "How do I reduce taxes in retirement?",
    ],
  };

  useEffect(() => {
    const storedId = localStorage.getItem("neoUserId") || uuidv4();
    localStorage.setItem("neoUserId", storedId);
    setUserId(storedId);

    if (storedId) {
      fetch(`/api/load-sessions?userId=${storedId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.sessions) {
            setSessions(data.sessions);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (scrollOnNextMessage && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setScrollOnNextMessage(false);
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setScrollOnNextMessage(true);
    setShowHistory(false);
    setInput("");
    setLoading(true);
    setSuggested([]);

    fetch("/api/question-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: input.trim(),
        timestamp: new Date().toISOString(),
        userId,
      }),
    });

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let streamed = "";
    const assistantReply: Message = { role: "assistant", content: "" };
    const updatedMessages = [...newMessages, assistantReply];
    setMessages(updatedMessages);

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      streamed += decoder.decode(value, { stream: true });
      assistantReply.content = streamed;
      setMessages([...updatedMessages]);
    }

    setLoading(false);

    setTimeout(async () => {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: assistantReply.content }),
      });

      const follow = await res.json();

      if (follow?.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: follow.reply }]);
      }

      if (follow?.suggestions?.length) {
        setSuggested(follow.suggestions.slice(0, 2));
      }
    }, 1000);
  };

  const handleSaveSession = async () => {
    if (!userId || messages.length < 2) return;

    const title = `Chat – ${new Date().toLocaleDateString("en-US")}`;
    await fetch("/api/save-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, messages, title }),
    });
  };

  const handleStartNewChat = async () => {
    await handleSaveSession();
    const systemMessage: Message = {
      role: "system",
      content:
        "Hi, I’m Neo — your financial AI assistant, trained by a human CFP®. Ask me anything to get started.",
    };

    setMessages([systemMessage]);
    setSuggested([]);
    setSelectedCategory(null);
    setShowCategories(true);
    setShowHistory(false);
  };

  const handleLoadSession = async (sessionId: string) => {
    const res = await fetch(`/api/load-session?id=${sessionId}`);
    const data = await res.json();

    if (Array.isArray(data?.messages) && data.messages.length > 0) {
      setMessages(data.messages);
      setShowCategories(false);
      setSelectedCategory(null);
      setShowHistory(false);
      setScrollOnNextMessage(true);
      setInput("Can we continue where we left off?");
    } else {
      console.warn("⚠️ No messages loaded from session:", data);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    await fetch("/api/delete-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <>
      <Head>
        <title>Neo — Your AI Financial Assistant</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-4 text-gray-900 font-sans">
        <h1 className="text-center text-2xl font-bold mb-1">
          Neo — Your AI Financial Assistant
        </h1>
        <p className="text-center text-gray-600 mb-4">Ask questions. Get answers.</p>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <div
            ref={chatRef}
            className="space-y-4 mb-4 min-h-[50vh] max-h-[75vh] md:max-h-[60vh] overflow-y-auto"
          >
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span
                  className={`inline-block px-4 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap text-left ${
                    m.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {m.content}
                </span>

                {m.role === "assistant" && m.content.length > 99 && (
                  <div className="text-sm mt-1">
                    {["up", "neutral", "down"].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setFeedback({ ...feedback, [i]: type });
                          fetch("/api/feedback-log", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              messageIndex: i,
                              feedback: type,
                              message: messages[i]?.content,
                              timestamp: new Date().toISOString(),
                              userId,
                            }),
                          });
                        }}
                        className={`${
                          type === "neutral" ? "mx-2" : ""
                        } ${feedback[i] === type ? "text-xl scale-110" : "opacity-50"}`}
                      >
                        {type === "up" ? "👍" : type === "neutral" ? "🤔" : "👎"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-1 text-sm text-gray-500 italic">
                <span>Neo is typing</span>
                <span className="dot-animation">.</span>
                <span className="dot-animation delay-200">.</span>
                <span className="dot-animation delay-400">.</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring"
            />
            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
              Send
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-4 space-x-4">
            <button onClick={handleStartNewChat} className="underline">
              Start New Chat
            </button>
            <button
              onClick={() => {
                setShowHistory((prev) => !prev);
              }}
              className="underline"
            >
              View History
            </button>
          </div>
                    {showHistory && sessions.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 border-t pt-4 max-w-2xl mx-auto">
              <div className="max-h-60 overflow-y-auto pr-1">
                <ul className="space-y-2">
                  {sessions.map((session) => (
                    <li key={session.id} className="flex justify-between items-center">
                      <span>
                        {new Date(session.updated_at).toLocaleString("en-US", {
                          dateStyle: "long",
                          timeStyle: "short",
                        })}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleLoadSession(session.id)} className="underline">
                          View
                        </button>
                        <button onClick={() => handleDeleteSession(session.id)} className="text-red-500 underline">
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {suggested.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {suggested.map((q, i) => (
                <button
                  key={i}
                  className="bg-gray-100 border px-3 py-1 rounded text-sm hover:bg-gray-200"
                  onClick={() => setInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {showCategories && !selectedCategory && (
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {Object.keys(categories).map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-gray-100 border px-3 py-1 rounded text-sm hover:bg-gray-200"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {showCategories && selectedCategory && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-700 mb-2">{selectedCategory}</h2>
              <div className="flex flex-wrap gap-2">
                {categories[selectedCategory as keyof typeof categories].map((q, j) => (
                  <button
                    key={j}
                    className="bg-gray-100 border px-3 py-1 rounded text-sm hover:bg-gray-200"
                    onClick={() => setInput(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded shadow"
              onClick={() => setShowCalculator(true)}
            >
              Mortgage Calculator
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded shadow"
              onClick={() => setShowCFP(true)}
            >
              Talk to a CFP®
            </button>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow"
              onClick={() => setShowInvestmentCheck(true)}
            >
              Investment Check
            </button>
          </div>
        </div>

        {showCalculator && (
          <Modal title="Mortgage Calculator" onClose={() => setShowCalculator(false)}>
            <MortgageCalculator />
          </Modal>
        )}
        {showCFP && (
          <Modal title="Talk to a CFP®" onClose={() => setShowCFP(false)}>
            <p>This feature is coming soon! You’ll be able to connect with a human advisor.</p>
          </Modal>
        )}
        {showInvestmentCheck && (
          <Modal title="Investment Check" onClose={() => setShowInvestmentCheck(false)}>
            <p>Coming soon: Neo will help you assess your portfolio and ask smarter questions.</p>
          </Modal>
        )}
      </div>
    </>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
        <button className="absolute top-2 right-3 text-xl" onClick={onClose}>
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function MortgageCalculator() {
  const [price, setPrice] = useState("500000");
  const [down, setDown] = useState("100000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState(30);
  const [monthly, setMonthly] = useState("0.00");
  const [loanType, setLoanType] = useState("30-year fixed");

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? "" : `$${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  const parseCurrency = (value: string) =>
    parseFloat(value.replace(/[^0-9.]/g, "")) || 0;

  const parseRate = (value: string) =>
    parseFloat(value.replace(/[^0-9.]/g, "")) || 0;

  const handleCalc = () => {
    const loan = parseCurrency(price) - parseCurrency(down);
    const r = parseRate(rate) / 100 / 12;
    const n = years * 12;

    let m =
      loanType === "interest-only"
        ? loan * r
        : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    setMonthly(isFinite(m) ? m.toFixed(2) : "0.00");
  };

  const handleLoanTypeChange = (type: string) => {
    setLoanType(type);
    setYears(type === "15-year fixed" ? 15 : 30);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block mb-1">Loan Type</label>
        <select
          value={loanType}
          onChange={(e) => handleLoanTypeChange(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option>30-year fixed</option>
          <option>15-year fixed</option>
          <option>interest-only</option>
          <option>adjustable (ARM)</option>
        </select>
      </div>
      <input
        type="text"
        value={formatCurrency(price)}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        placeholder="Home Price"
      />
      <input
        type="text"
        value={formatCurrency(down)}
        onChange={(e) => setDown(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        placeholder="Down Payment"
      />
      <input
        type="text"
        value={`${rate.replace(/[^0-9.]/g, "")}%`}
        onChange={(e) => setRate(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        placeholder="Interest Rate (%)"
      />
      <div className="text-sm text-gray-600">Estimated Term: {years} years</div>
      <button onClick={handleCalc} className="w-full bg-blue-600 text-white py-2 rounded">
        Calculate
      </button>
      <div className="text-center font-bold">
        Estimated Monthly: ${parseFloat(monthly).toLocaleString("en-US")}
      </div>
    </div>
  );
}         