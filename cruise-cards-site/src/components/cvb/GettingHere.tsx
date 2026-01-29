export function GettingHere() {
  return (
    <section id="getting-here" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-heading text-3xl text-navy">Getting to the Port of Galveston</h2>
      <p className="mt-4 max-w-3xl text-driftwood">
        Many of our guests arrive via I-10 East from Houston, Beaumont, Lake Charles, and surrounding areas.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded bg-sand p-6">
          <h3 className="font-heading text-xl text-navy">Route overview</h3>
          <ul className="mt-3 list-disc pl-5 text-driftwood">
            <li>I-10 East highlighted</li>
            <li>Loop 610 / Beltway 8 feeder routes</li>
            <li>Galveston Causeway entry</li>
          </ul>
        </div>
        <div className="rounded bg-sand p-6">
          <h3 className="font-heading text-xl text-navy">Park & Ride for I-10 East Travelers</h3>
          <p className="mt-2 text-driftwood">Secure parking and cruise shuttle service available at:</p>
          <p className="mt-3 font-semibold text-navy">11221 Market Street, Jacinto City, TX 77029</p>
          <a
            href="https://houstoncruisehuttle.com"
            className="mt-3 inline-block text-harbor underline"
            target="_blank"
            rel="noreferrer"
          >
            Visit HoustonCruiseShuttle.com
          </a>
        </div>
      </div>
    </section>
  );
}
