import { useState, useEffect, useRef } from "react";
import Head from "next/head";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Hi, I’m Neo — your AI financial assistant, backed by a human CFP®. Ask me anything to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ [index: number]: string }>({});
  const [suggested, setSuggested] = useState<string[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCFP, setShowCFP] = useState(false);
  const [showInvestmentCheck, setShowInvestmentCheck] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

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
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight - 150,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowCategories(false);
    setSuggested([]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.reply) {
      const assistantReply = { role: "assistant", content: data.reply };
      const updatedMessages = [...newMessages, assistantReply];
      setMessages(updatedMessages);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Want to keep going on this? Or would you rather jump to something new?",
          },
        ]);
      }, 2000);

      const lower = input.toLowerCase();

      if (lower.includes("roth")) {
        setSuggested([
          "Can I contribute to a Roth and a 401(k)?",
          "What are the withdrawal rules?",
        ]);
      } else if (lower.includes("529")) {
        setSuggested([
          "What if my kid doesn’t go to college?",
          "Can I change the beneficiary?",
        ]);
      } else if (lower.includes("retire")) {
        setSuggested([
          "When should I take Social Security?",
          "What’s a good withdrawal strategy?",
        ]);
      } else if (lower.includes("mortgage")) {
        setSuggested([
          "How much should I put down?",
          "What is PMI and can I avoid it?",
        ]);
      } else {
        setSuggested([
          "Can you explain that more?",
          "What else should I consider?",
        ]);
      }
    } else {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong." }]);
    }
  };
  return (
    <>
      <Head>
        <title>Neo — Your AI Financial Assistant</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-4 text-gray-900 font-sans">
        <h1 className="text-center text-2xl font-bold mb-1">Neo — Your AI Financial Assistant</h1>
        <p className="text-center text-gray-600 mb-4">Ask questions. Get answers.</p>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <div ref={chatRef} className="space-y-4 mb-4 h-[600px] overflow-y-auto border p-3 bg-gray-50 rounded">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span
                  className={`inline-block px-4 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap text-left ${
                    m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {m.content}
                </span>
                {m.role === "assistant" && m.content.length > 99 && (
                  <div className="text-sm mt-1">
                    <button onClick={() => setFeedback({ ...feedback, [i]: "up" })}>👍</button>
                    <button onClick={() => setFeedback({ ...feedback, [i]: "neutral" })} className="mx-2">🤔</button>
                    <button onClick={() => setFeedback({ ...feedback, [i]: "down" })}>👎</button>
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-sm text-gray-500 italic">Neo is thinking...</div>}
          </div>

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

          {showCategories && (
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {Object.keys(categories).map((cat, i) => (
                <button
                  key={i}
                  className="border px-4 py-2 rounded text-sm hover:bg-gray-100"
                  onClick={() => {
                    setInput("");
                    setSuggested(categories[cat]);
                    setShowCategories(false);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring"
            />
            <button type="submit" className="bg-black text-white px-4 py-2 rounded">Send</button>
          </form>

          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <button className="bg-blue-600 text-white px-4 py-2 rounded shadow" onClick={() => setShowCalculator(true)}>
              Mortgage Calculator
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded shadow" onClick={() => setShowCFP(true)}>
              Talk to a CFP®
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow" onClick={() => setShowInvestmentCheck(true)}>
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
            <p>This feature is coming soon! You'll be able to connect directly with a human advisor.</p>
          </Modal>
        )}
        {showInvestmentCheck && (
          <Modal title="Investment Check" onClose={() => setShowInvestmentCheck(false)}>
            <p>Coming soon: Neo will help you assess your portfolio, estimate fees, and ask smarter questions.</p>
          </Modal>
        )}
      </div>
    </>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
        <button className="absolute top-2 right-3 text-xl" onClick={onClose}>×</button>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function MortgageCalculator() {
  const [price, setPrice] = useState(500000);
  const [down, setDown] = useState(100000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [monthly, setMonthly] = useState("0.00");

  const handleCalc = () => {
    const loan = price - down;
    const r = rate / 100 / 12;
    const n = years * 12;
    const m = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setMonthly(isFinite(m) ? m.toFixed(2) : "0.00");
  };

  return (
    <div className="space-y-3">
      <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Home Price" />
      <input type="number" value={down} onChange={(e) => setDown(+e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Down Payment" />
      <input type="number" value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Interest Rate (%)" />
      <input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Loan Term (years)" />
      <button onClick={handleCalc} className="w-full bg-blue-600 text-white py-2 rounded">Calculate</button>
      <div className="text-center font-bold">Estimated Monthly: ${monthly}</div>
    </div>
  );
}