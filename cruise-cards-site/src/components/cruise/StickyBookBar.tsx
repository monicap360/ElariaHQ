type StickyBookBarProps = {
  price: string;
  reserveHref?: string;
};

export default function StickyBookBar({ price, reserveHref = "/booking" }: StickyBookBarProps) {
  return (
    <div className="sticky bottom-0 mt-8 flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-slate">
      <span className="font-medium text-navy">From {price} per person</span>
      <a href={reserveHref} className="rounded-lg bg-primary-blue px-6 py-2 text-white hover:bg-primary-blue/90">
        Reserve with Deposit
      </a>
    </div>
  );
}
