import { useEffect, useMemo, useState } from "react";
import { Newspaper } from "lucide-react";
import { getNewsSource } from "../data/newsSources.js";

export default function NewspaperDropdown({ country, variant = "light" }) {
  const selected = useMemo(() => getNewsSource(country), [country]);
  const stories = selected.stories;
  const tickerStories = useMemo(() => [...stories, ...stories, ...stories], [stories]);
  const [activeIndex, setActiveIndex] = useState(0);
  const glass = variant === "glass";

  useEffect(() => {
    setActiveIndex(0);
  }, [country]);

  useEffect(() => {
    if (stories.length < 2) return undefined;
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % stories.length);
    }, 3800);
    return () => window.clearInterval(intervalId);
  }, [stories.length]);

  const activeStory = stories[activeIndex] || stories[0];

  return (
    <section
      className={`grid h-12 min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] overflow-hidden rounded-md border shadow-sm backdrop-blur-xl sm:max-w-4xl ${
        glass
          ? "border-cyan-100/25 bg-[#0b2238]/85 text-white shadow-cyan-950/40 ring-1 ring-white/10"
          : "border-white/30 bg-white/95 text-slate-950"
      }`}
    >
      <a
        className={`row-span-2 flex shrink-0 items-center gap-2 border-r px-3 text-xs font-black uppercase hover:bg-white/10 ${
          glass ? "border-white/10 text-white" : "border-slate-200 text-brandBlue hover:bg-slate-50"
        }`}
        href={selected.url}
        target="_blank"
        rel="noreferrer"
        title={`Fuente: ${selected.source}`}
      >
        <Newspaper size={16} />
        <span className="hidden sm:inline">{selected.source}</span>
      </a>

      <a
        href={activeStory.url}
        target="_blank"
        rel="noreferrer"
        className={`flex min-w-0 items-center gap-2 border-b px-3 text-xs font-black hover:text-cyan-200 sm:text-sm ${
          glass ? "border-white/10 text-white" : "border-slate-100 text-slate-950 hover:text-brandBlue"
        }`}
      >
        <span className="shrink-0 rounded-full bg-brandBlue px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
          {selected.country}
        </span>
        <span className="truncate">{activeStory.title}</span>
        <span className={`hidden shrink-0 text-[11px] font-bold md:inline ${glass ? "text-white/45" : "text-slate-400"}`}>
          Fuente: {selected.source}
        </span>
      </a>

      <div className="news-marquee-viewport relative min-w-0 overflow-hidden">
        <div className="news-marquee-track flex h-full w-max items-center gap-7 whitespace-nowrap px-3 text-[11px] font-bold sm:text-xs">
          {tickerStories.map((story, index) => (
            <a
              key={`${story.url}-${index}`}
              href={story.url}
              target="_blank"
              rel="noreferrer"
              className={`relative z-10 inline-flex items-center gap-2 hover:text-cyan-200 ${
                glass ? "text-white/80" : "text-slate-700 hover:text-brandBlue"
              }`}
            >
              <span className="text-brandRed">Ultima hora</span>
              <span>{story.title}</span>
              <span className={glass ? "text-white/40" : "text-slate-400"}>Fuente: {selected.source}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
