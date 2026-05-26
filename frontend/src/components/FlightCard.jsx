export default function FlightCard({ label, flight }) {
  if (!flight) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-2 text-sm text-slate-500">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-xl font-semibold">
        {flight.price} {flight.currency}
      </p>
      <p className="text-sm text-slate-600">
        {flight.originIata} - {flight.destinationIata} | {flight.departureDate}
      </p>
      <p className="text-sm text-slate-600">
        Duracion: {flight.duration} | Escalas: {flight.stops}
      </p>
    </div>
  );
}
