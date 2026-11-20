const paths = {
  clean: "M8 4h8l1 3h3v2H4V7h3l1-3zm1 7h6l1 9H8l1-9z",
  tool: "M14 7l3 3-7 7H7v-3l7-7zm2-2l2 2",
  drop: "M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  paint: "M5 19h6m-6-4l8-8 3 3-8 8H5v-3z",
  book: "M5 5h6a3 3 0 013 3v11a3 3 0 00-3-3H5V5zm14 0h-6a3 3 0 00-3 3v11a3 3 0 013-3h6V5z",
  heart: "M12 20s-7-4.4-7-9a4 4 0 017-2 4 4 0 017 2c0 4.6-7 9-7 9z",
  car: "M4 15l2-5h12l2 5M6 15h12M7 18a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-5-5",
  pin: "M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zm0-8a3 3 0 100-6 3 3 0 000 6z",
  lock: "M8 11V8a4 4 0 118 0v3m-9 0h10v9H7v-9z",
};

export default function Icon({ name, className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={paths[name] || paths.search} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
