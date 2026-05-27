export default function Timeline({ items }) {
  if (!items?.length) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-base font-semibold">Itinerario</h3>
        <p className="text-sm text-slate-500">Sin actividades.</p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-base font-semibold">Itinerario</h3>
      <ol className="space-y-3">
        {items.map((item) => (
          <li key={`${item.day}-${item.date}`} className="rounded border border-slate-100 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Dia {item.day}</p>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-sm text-slate-600">
              {item.date} - {item.location}
            </p>
            {item.venue && <p className="text-sm font-semibold text-slate-700">{item.venue}</p>}
            <p className="text-sm text-slate-600">{item.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
