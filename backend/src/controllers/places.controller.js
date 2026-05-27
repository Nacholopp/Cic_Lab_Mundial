import { getDestinationGuide } from "../services/places.service.js";

export async function destinationGuide(req, res) {
  const city = req.query.city?.toString();
  if (!city) {
    return res.status(400).json({ ok: false, error: "city is required" });
  }

  const guide = await getDestinationGuide({
    city,
    originCity: req.query.originCity?.toString() || ""
  });

  res.json({ ok: true, guide });
}
