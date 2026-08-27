import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  title?: string;
  subtitle?: string;
}

export default function ProductGrid({
  products,
  columns = 4,
  title,
  subtitle,
}: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <section>
      {(title || subtitle) && (
        <div className="mb-10">
          {title && <h2 className="section-title">{title}</h2>}
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      )}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <svg
            className="w-12 h-12 text-charcoal-200 mb-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          <h3 className="text-lg font-medium text-charcoal-900">No products found</h3>
          <p className="text-charcoal-400 mt-1.5 text-sm font-light">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className={`grid ${gridCols[columns]} gap-x-5 gap-y-10 sm:gap-x-7`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
