export const metadata = {
  title: "CruiseDecisionEngine — Core System Design",
  description: "System design outline for the CruiseDecisionEngine scoring and ranking workflow.",
};

export default function CruiseDecisionEnginePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-text-primary">
      <header className="rounded-3xl border border-white/10 bg-background-panel/80 px-8 py-10">
        <p className="text-xs uppercase tracking-[0.35em] text-text-muted">CruiseDecisionEngine</p>
        <h1 className="mt-3 text-3xl font-semibold font-accent">Core System Design</h1>
        <p className="mt-4 max-w-2xl text-sm text-text-secondary">
          This engine does one job: given traveler intent, return ranked sailings with reasons and confidence. It does
          not talk to users directly. It does not book. It does not guess.
        </p>
      </header>

      <section className="mt-10 grid gap-6">
        <div className="rounded-2xl border border-white/10 bg-background-card/70 p-6">
          <h2 className="text-xl font-semibold">1. Inputs (Strict Contract)</h2>
          <p className="mt-2 text-sm text-text-secondary">If a field is missing, the engine degrades gracefully.</p>
          <pre className="mt-4 whitespace-pre-wrap text-xs text-text-secondary">
            {`CruiseDecisionInput {
  departurePort: "Galveston"
  dateRange: {
    start: Date
    end: Date
  }
  passengers: {
    adults: number
    children?: number
  }
  budget?: {
    maxPerPerson?: number
    flexible?: boolean
  }
  preferences?: {
    cruiseLine?: string[]
    shipClass?: string[]
    itinerary?: string[]
    cabinType?: string[]
  }
  constraints?: {
    mustSailWeekend?: boolean
    seaPayEligibleOnly?: boolean
  }
}`}
          </pre>
        </div>

        <div className="rounded-2xl border border-white/10 bg-background-card/70 p-6">
          <h2 className="text-xl font-semibold">2. Data Sources (Read-Only)</h2>
          <p className="mt-2 text-sm text-text-secondary">The engine never mutates data.</p>
          <ul className="mt-4 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
            <li>• sailings</li>
            <li>• ships</li>
            <li>• cabins</li>
            <li>• pricing_snapshots</li>
            <li>• deposit_rules</li>
            <li>• availability_cache</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-background-card/70 p-6">
          <h2 className="text-xl font-semibold">3. Parallel Scoring</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Each sailing is evaluated simultaneously across independent lenses. Each score is normalized to 0–1.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-text-secondary">
            <li>• Price Efficiency Score (price vs market median)</li>
            <li>• Cabin Value Score (best cabin available / price)</li>
            <li>• Demand Pressure Score (how fast this sailing is filling)</li>
            <li>• Risk Score (cancellation risk + policy friction + inventory volatility)</li>
            <li>• Preference Match Score (line, ship, itinerary alignment)</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-background-card/70 p-6">
          <h2 className="text-xl font-semibold">4. Weighted Resolution (Deterministic)</h2>
          <p className="mt-2 text-sm text-text-secondary">Same input yields the same output. That is non-negotiable.</p>
          <pre className="mt-4 whitespace-pre-wrap text-xs text-text-secondary">
            {`weights = {
  price: 0.25,
  cabin: 0.20,
  preference: 0.20,
  demand: 0.15,
  risk: 0.20
}

finalScore =
(price * w1) +
(cabin * w2) +
(preference * w3) -
(demand * w4) -
(risk * w5)`}
          </pre>
        </div>

        <div className="rounded-2xl border border-white/10 bg-background-card/70 p-6">
          <h2 className="text-xl font-semibold">5. Output (Explainable by Design)</h2>
          <pre className="mt-4 whitespace-pre-wrap text-xs text-text-secondary">
            {`CruiseDecisionResult {
  sailingId: string
  score: number
  confidence: number
  reasons: string[]
  flags?: string[]
}`}
          </pre>
          <p className="mt-3 text-sm text-text-secondary">Example reasons:</p>
          <ul className="mt-3 grid gap-2 text-sm text-text-secondary">
            <li>• Strong cabin value for your budget</li>
            <li>• Low cancellation risk</li>
            <li>• Matches preferred itinerary</li>
            <li>• High demand — limited availability</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-background-card/70 p-6">
          <h2 className="text-xl font-semibold">6. Confidence Calculation</h2>
          <p className="mt-2 text-sm text-text-secondary">
            confidence = (dataCompleteness × scoreSeparation × ruleStability). Low confidence is allowed.
          </p>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-background-panel/80 p-6">
          <h2 className="text-xl font-semibold">Customer View (No AI Talk)</h2>
          <p className="mt-3 text-sm text-text-secondary">Hero prompt: “Find the best cruise from Galveston for you.”</p>
          <div className="mt-4 rounded-xl border border-white/10 bg-background-card/80 p-4 text-sm text-text-secondary">
            <p className="text-text-primary">Carnival Breeze</p>
            <p>5-Day Western Caribbean</p>
            <ul className="mt-3 grid gap-1">
              <li>✔ Best value for your dates</li>
              <li>✔ Balcony upgrade available</li>
              <li>⚠ Limited availability</li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            No sliders. No filters unless needed. Just ranked clarity.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-background-panel/80 p-6">
          <h2 className="text-xl font-semibold">Admin Design (Control Layer)</h2>
          <ul className="mt-3 grid gap-2 text-sm text-text-secondary">
            <li>• Decision Log table with input hashes, confidence, and score spread</li>
            <li>• Override ability: disable engine per sailing</li>
            <li>• Adjust weights safely</li>
            <li>• Force human review when confidence is low</li>
          </ul>
          <pre className="mt-4 whitespace-pre-wrap text-xs text-text-secondary">
            {`decision_logs {
  id
  input_hash
  top_sailing_id
  score_spread
  confidence
  created_at
}`}
          </pre>
        </div>
      </section>
    </main>
  );
}
