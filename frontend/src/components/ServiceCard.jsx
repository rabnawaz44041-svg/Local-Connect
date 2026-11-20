import { Link } from "react-router-dom";
import { imageForCategory } from "../data/catalog";
import { formatPrice } from "../utils/format";

export default function ServiceCard({ service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="lift flex flex-col gap-4 rounded-[1.5rem] border border-line border-l-4 border-l-leaf bg-white p-4 shadow-sm hover:shadow-md sm:flex-row"
    >
      <img
        src={imageForCategory(service.category)}
        alt=""
        className="h-40 w-full rounded-xl object-cover sm:h-32 sm:w-44"
      />
      <div className="flex flex-1 flex-col">
        <p className="text-sm font-bold text-coral">{service.category}</p>
        <h3 className="mt-1 text-xl font-extrabold">{service.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{service.description}</p>
        <p className="mt-auto pt-3 text-sm text-ink">
          {service.provider?.name || "Local pro"} · {service.location}
        </p>
      </div>
      <div className="sm:text-right">
        <p className="text-lg font-extrabold">{formatPrice(service.price, service.currency)}</p>
        <p className="text-xs text-muted">starting price</p>
      </div>
    </Link>
  );
}
