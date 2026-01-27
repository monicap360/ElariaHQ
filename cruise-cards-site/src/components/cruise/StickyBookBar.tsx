type StickyBookBarProps = {
  price: string;
  reserveHref?: string;
};

export default function StickyBookBar({ price, reserveHref = "/booking" }: StickyBookBarProps) {
  return (
    <div className="sticky bottom-0 mt-8 flex items-center justify-between bg-navy px-4 py-3 text-white">
      <span className="font-medium">From {price} per person</span>
      <a href={reserveHref} className="rounded-lg bg-teal px-6 py-2 text-white">
        Reserve with Deposit
      </a>
    </div>
  );
}
