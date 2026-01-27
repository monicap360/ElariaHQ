type Factor = {
  label: string;
  value: number;
  warning?: boolean;
  note?: string;
};

type WhyThisCruiseProps = {
  factors: Factor[];
};

export default function WhyThisCruise({ factors }: WhyThisCruiseProps) {
  return (
    <section className="mt-6 rounded-2xl bg-sand p-6">
      <h3 className="mb-4 font-semibold text-navy">Why this cruise works for you</h3>
      <div className="space-y-4">
        {factors.map((factor) => (
          <div key={factor.label}>
            <div className="mb-1 flex justify-between text-sm text-slate">
              <span>{factor.label}</span>
              {factor.note && <span className="text-warning">{factor.note}</span>}
            </div>
            <div className="h-2 rounded bg-gray-200">
              <div
                className={`h-2 rounded ${factor.warning ? "bg-warning" : "bg-teal"}`}
                style={{ width: `${factor.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
