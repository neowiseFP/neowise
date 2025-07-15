// pages/dashboard/planning.tsx
import Navbar from '@/components/Navbar'

export default function PlanningPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto py-10 px-4 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Planning Overview</h1>

        {/* Retirement Plan */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">🎯 Retirement Plan</h2>
          <p className="text-gray-700 mb-4">
            You’ve saved <strong>$95,000</strong> toward your <strong>$1.2M</strong> goal.
            Target retirement age: <strong>55</strong>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '8%' }} />
          </div>
          <p className="text-sm text-gray-500">You're on track — but increasing your savings by $500/month could shave 3 years off your retirement date.</p>
        </section>

        {/* Smart Insights */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">💡 Smart Insights</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>You’re currently saving 14% of your income — consider bumping it to 18% to stay ahead of inflation.</li>
            <li>Your largest upcoming goal is a down payment in 2 years — you’re 32% of the way there.</li>
            <li>You have no estate plan on file — consider adding a basic will and healthcare directive.</li>
          </ul>
        </section>

        {/* Life Goals */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">🏆 Life Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-800">🏡 Buy a Home</h3>
              <p className="text-sm text-gray-600 mb-1">Goal: $120,000 • Saved: $38,400 (32%)</p>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-800">🎓 Kids’ College Fund</h3>
              <p className="text-sm text-gray-600 mb-1">Goal: $150,000 • Saved: $22,500 (15%)</p>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Insurance Coverage */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">🛡 Insurance Review</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>✅ Health Insurance — Covered through employer</li>
            <li>✅ Auto Insurance — $100K liability + collision</li>
            <li>⚠️ Life Insurance — No active policy</li>
            <li>⚠️ Disability Insurance — Missing</li>
          </ul>
          <p className="text-sm text-gray-500 mt-2">Consider a $500K term life policy and disability coverage to protect your family.</p>
        </section>

        {/* Call to Action */}
        <section className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-700 text-lg">
            Want help refining your plan? Head back to <a href="/chat" className="text-blue-600 font-semibold hover:underline">Chat</a> and ask Neo anything.
          </p>
        </section>
      </main>
    </div>
  )
}