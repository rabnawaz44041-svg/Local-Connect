import { Link } from "react-router-dom";

const columns = [
  {
    title: "Consider it done.",
    links: [
      ["About", "/info/about"],
      ["Partner with us", "/info/partner"],
      ["For developers", "/info/developers"],
      ["Careers", "/info/careers"],
      ["Press", "/info/press"],
      ["Blog", "/info/blog"],
    ],
  },
  {
    title: "Customers",
    links: [
      ["How to use LocalConnect", "/info/how-to"],
      ["Sign up", "/register"],
      ["Get the app", "/info/app"],
      ["Services near me", "/services"],
      ["Cost estimates", "/info/cost-estimates"],
      ["Home resource center", "/info/resources"],
    ],
  },
  {
    title: "Pros",
    links: [
      ["LocalConnect for pros", "/info/for-pros"],
      ["Sign up as a pro", "/signup/provider"],
      ["Community", "/info/community"],
      ["Pro resources", "/info/pro-resources"],
      ["Pro reviews", "/info/pro-reviews"],
      ["iPhone app for pros", "/info/pro-iphone"],
      ["Android app for pros", "/info/pro-android"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Help", "/info/help"],
      ["Safety", "/info/safety"],
      ["Terms of Use", "/info/terms"],
      ["Privacy Policy", "/info/privacy"],
      ["Patents", "/info/patents"],
      ["CA Notice at Collection", "/info/ca-notice"],
      ["Do not sell or share my personal information", "/info/do-not-sell"],
    ],
  },
];

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com",
    path: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 4.2A4.8 4.8 0 1016.8 12 4.8 4.8 0 0012 7.2zM17.2 6.3a1.1 1.1 0 11-1.1 1.1 1.1 1.1 0 011.1-1.1zM12 9.2A2.8 2.8 0 1114.8 12 2.8 2.8 0 0112 9.2z",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com",
    path: "M14 8h3V5h-3c-2.8 0-5 2.2-5 5v2H7v3h2v7h3v-7h2.6l.4-3H12V9.2c0-.7.5-1.2 2-1.2z",
  },
  {
    name: "X",
    href: "https://x.com",
    path: "M4 4h4.3l3.1 4.3L15 4H20l-5.7 7.3L20.4 20h-4.2l-3.4-4.6L8.4 20H4l6-7.7L4 4z",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com",
    path: "M6.5 9H9v10H6.5zM7.8 4.8A1.6 1.6 0 117.8 8a1.6 1.6 0 010-3.2zM11 9h2.4v1.4h.1c.3-.6 1.2-1.4 2.6-1.4 2.8 0 3.3 1.8 3.3 4.2V19H17v-4.4c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3V19H11z",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com",
    path: "M23 12.2s0-3.2-.4-4.6a2.7 2.7 0 00-1.9-1.9C18.9 5.3 12 5.3 12 5.3s-6.9 0-8.7.4a2.7 2.7 0 00-1.9 1.9C1 9 1 12.2 1 12.2s0 3.2.4 4.6a2.7 2.7 0 001.9 1.9c1.8.4 8.7.4 8.7.4s6.9 0 8.7-.4a2.7 2.7 0 001.9-1.9c.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l5.8 3.3-5.8 3.3z",
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-extrabold">{column.title}</p>
            <ul className="mt-4 space-y-3">
              {column.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted transition duration-200 hover:text-leaf">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">© {new Date().getFullYear()} LocalConnect</p>
          <div className="flex items-center gap-3">
            {socials.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.name}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition duration-200 hover:-translate-y-0.5 hover:border-leaf hover:text-leaf"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d={item.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
