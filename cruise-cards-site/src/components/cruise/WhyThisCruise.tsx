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
    <section className="why-this">
      <h4>Why this cruise works for you</h4>
      <div className="space-y-4">
        {factors.map((factor) => (
          <div key={factor.label} className={`factor${factor.warning ? " caution" : ""}`}>
            <span>{factor.label}</span>
            <div className="bar">
              <div style={{ width: `${factor.value}%` }} />
            </div>
            {factor.note && <small>{factor.note}</small>}
          </div>
        ))}
      </div>
    </section>
  );
}
