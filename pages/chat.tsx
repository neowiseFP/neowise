// pages/chat.tsx
import Navbar from '@/components/Navbar'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-semibold mb-4">Neo — Your Financial AI Assistant</h1>
        <p className="text-gray-600 mb-6">Ask anything to get started, or explore tools using the navbar above.</p>

        {/* Replace this with your real chat UI */}
        <p className="text-gray-500">[Chat UI goes here]</p>
      </main>
    </div>
  )
}
