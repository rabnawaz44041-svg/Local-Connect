import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icons";

export default function SearchForm({
  initialQuery = "",
  initialLocation = "",
  variant = "hero",
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  const onSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());
    navigate(`/services?${params.toString()}`);
  };

  const hero = variant === "hero";

  return (
    <form
      onSubmit={onSubmit}
      className={
        hero
          ? "rounded-2xl bg-white p-2 shadow-2xl sm:p-3"
          : "rounded-full border border-line bg-white p-1 shadow-sm"
      }
    >
      <div className={`flex flex-col gap-2 ${hero ? "md:flex-row md:items-center" : "sm:flex-row sm:items-center"}`}>
        <label className={`flex flex-1 items-center gap-2 px-3 ${hero ? "py-2" : "py-1"}`}>
          <Icon name="search" className="h-5 w-5 shrink-0 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Describe your project or problem"
            className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-muted"
          />
        </label>
        <label className={`flex items-center gap-2 px-3 ${hero ? "md:w-52" : "sm:w-44"}`}>
          <Icon name="pin" className="h-5 w-5 shrink-0 text-muted" />
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City"
            className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-muted"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-[#142838]"
        >
          Find a pro
        </button>
      </div>
    </form>
  );
}
