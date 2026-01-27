type Cabin = {
  type: string;
  note: string;
  price: string;
  featured?: boolean;
};

type CabinPreviewProps = {
  cabins: Cabin[];
};

export default function CabinPreview({ cabins }: CabinPreviewProps) {
  return (
    <section className="mt-6">
      <h3 className="mb-4 font-semibold text-navy">Available cabin types</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {cabins.map((cabin) => (
          <div
            key={cabin.type}
            className={`rounded-xl p-4 shadow ${
              cabin.featured ? "border-2 border-teal bg-cloud" : "bg-cloud"
            }`}
          >
            <h4 className="font-medium text-navy">{cabin.type}</h4>
            <p className="text-sm text-slate">{cabin.note}</p>
            <span className="mt-2 block font-semibold text-navy">{cabin.price}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
