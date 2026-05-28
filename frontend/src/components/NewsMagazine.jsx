import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { getNewsSource, newsSources } from "../data/newsSources.js";

const storyImages = [
  {
    primary: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1510051640316-cee39563ddab?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80"
  },
  {
    primary: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=900&q=80",
    fallback: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80"
  }
];

const embeddedFallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 520'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2307172f'/%3E%3Cstop offset='0.48' stop-color='%23104462'/%3E%3Cstop offset='1' stop-color='%2320a36a'/%3E%3C/linearGradient%3E%3CradialGradient id='light' cx='0.5' cy='0.2' r='0.7'%3E%3Cstop offset='0' stop-color='%23ffffff' stop-opacity='0.42'/%3E%3Cstop offset='1' stop-color='%23ffffff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='900' height='520' fill='url(%23sky)'/%3E%3Crect width='900' height='520' fill='url(%23light)'/%3E%3Cpath d='M0 365c160-55 297-58 450-10 158 50 297 44 450-15v180H0z' fill='%230b7a3b'/%3E%3Cpath d='M90 430h720M250 380l-80 110M650 380l80 110M450 363v135' stroke='%23fff' stroke-opacity='.7' stroke-width='8' fill='none'/%3E%3Ccircle cx='450' cy='438' r='54' fill='none' stroke='%23fff' stroke-opacity='.65' stroke-width='8'/%3E%3Cg fill='%23fff' fill-opacity='.85'%3E%3Ccircle cx='158' cy='135' r='12'/%3E%3Ccircle cx='742' cy='112' r='10'/%3E%3Ccircle cx='690' cy='210' r='7'/%3E%3C/g%3E%3Ctext x='56' y='92' fill='%23fff' font-family='Arial,Helvetica,sans-serif' font-size='34' font-weight='800'%3EFutbol internacional%3C/text%3E%3C/svg%3E";

function handleNewsImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackStage === "embedded") return;

  if (image.dataset.fallbackStage === "primary" && image.dataset.fallbackSrc) {
    image.dataset.fallbackStage = "secondary";
    image.src = image.dataset.fallbackSrc;
    return;
  }

  image.dataset.fallbackStage = "embedded";
  image.src = embeddedFallbackImage;
}

function getStoryImageSet(index) {
  return storyImages[index % storyImages.length];
}

function normalizeStories(source) {
  return source.stories.map((story, index) => ({
    ...story,
    country: source.country,
    source: source.source
  }));
}

function withDistinctImages(story, index, visibleCount) {
  const primaryVisual = getStoryImageSet(index);
  const alternateVisual = getStoryImageSet(index + visibleCount);

  return {
    ...story,
    image: primaryVisual.primary,
    fallbackImage: primaryVisual.fallback,
    alternateImage: alternateVisual.primary,
    alternateFallbackImage: alternateVisual.fallback
  };
}

export default function NewsMagazine({ country }) {
  const cards = useMemo(() => {
    const selected = getNewsSource(country);
    const supportingSources = [newsSources.ES, newsSources.MX, newsSources.AR, newsSources.BR, newsSources.UEFA].filter(
      (source) => source.source !== selected.source
    );
    const pool = [
      ...normalizeStories(selected),
      ...supportingSources.flatMap((source) => normalizeStories(source))
    ];
    const visibleCount = 8;
    return pool.slice(0, visibleCount).map((story, index) => withDistinctImages(story, index, visibleCount));
  }, [country]);

  const featured = cards[0];
  const tickerCards = [...cards, ...cards];

  return (
    <section className="overflow-hidden bg-slate-950 py-10 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/15 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-brandRed">Prensa internacional</p>
            <h2 className="mt-2 text-3xl font-black sm:text-5xl">Noticias que se mueven contigo</h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-white/65">
            Titulares enlazados al medio deportivo elegido y fuentes clave del Mundial 2026.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_1.4fr]">
          <a
            href={featured.url}
            target="_blank"
            rel="noreferrer"
            className="group relative min-h-[360px] overflow-hidden rounded-lg border border-white/15 bg-white/5"
          >
            <img
              src={featured.image}
              data-fallback-stage="primary"
              data-fallback-src={featured.fallbackImage}
              onError={handleNewsImageError}
              alt={featured.title}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brandBlue px-3 py-1 text-xs font-black uppercase">{featured.country}</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-950">
                  {featured.source}
                </span>
              </div>
              <h3 className="max-w-xl text-2xl font-black leading-tight sm:text-4xl">{featured.title}</h3>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-white/80">
                Abrir noticia <ArrowUpRight size={17} />
              </span>
            </div>
          </a>

          <div className="relative overflow-hidden rounded-lg border border-white/15 bg-white/5 py-4">
            <div className="news-photo-track flex w-max gap-4 px-4">
              {tickerCards.map((story, index) => {
                const isRepeatedCard = index >= cards.length;
                const image = isRepeatedCard ? story.alternateImage : story.image;
                const fallbackImage = isRepeatedCard ? story.alternateFallbackImage : story.fallbackImage;

                return (
                  <a
                    key={`${story.url}-${index}`}
                    href={story.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block w-[280px] overflow-hidden rounded-md border border-white/10 bg-white text-slate-950 shadow-xl sm:w-[340px]"
                  >
                    <img
                      src={image}
                      data-fallback-stage="primary"
                      data-fallback-src={fallbackImage}
                      onError={handleNewsImageError}
                      alt={story.title}
                      className="h-44 w-full bg-slate-900 object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-brandBlue">
                          {story.country}
                        </span>
                        <span className="truncate text-[11px] font-black uppercase text-slate-400">{story.source}</span>
                      </div>
                      <h3 className="line-clamp-3 min-h-[72px] text-lg font-black leading-tight">{story.title}</h3>
                      <p className="mt-3 inline-flex items-center gap-1 text-sm font-black text-brandRed">
                        Leer ahora <ArrowUpRight size={15} />
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
