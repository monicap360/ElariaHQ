type Detail = {
  label: string;
  value: string;
};

type SailingDetailsProps = {
  details: Detail[];
};

export default function SailingDetails({ details }: SailingDetailsProps) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 font-semibold text-navy">Sailing details</h3>
      <ul className="grid grid-cols-1 gap-4 text-sm text-slate sm:grid-cols-2">
        {details.map((detail) => (
          <li key={detail.label}>
            <strong className="text-navy">{detail.label}:</strong> {detail.value}
          </li>
        ))}
      </ul>
    </section>
  );
}
