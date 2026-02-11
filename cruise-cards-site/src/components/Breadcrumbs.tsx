"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
      <div className="breadcrumbs-inner">
        <ol className="breadcrumbs-list">
          <li className="breadcrumb-item" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/" itemProp="item">
              <span itemProp="name">Home</span>
              <meta itemProp="position" content="1" />
            </Link>
            <span className="separator" aria-hidden="true">
              /
            </span>
          </li>

          {breadcrumbs.map((crumb, index) => (
            <li
              key={crumb.href ?? `${crumb.name}-${index}`}
              className={`breadcrumb-item ${crumb.isLast ? "active" : ""}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              data-category={crumb.meta?.category}
            >
              {crumb.isLast ? (
                <span itemProp="name">{crumb.name}</span>
              ) : (
                <Link href={crumb.href ?? "/"} itemProp="item">
                  <span itemProp="name">{crumb.name}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(index + 2)} />
              {!crumb.isLast && (
                <span className="separator" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          ))}
        </ol>

        {breadcrumbs.length > 1 && (
          <div className="breadcrumb-context">
            <Link
              href={breadcrumbs[breadcrumbs.length - 2].href ?? "/"}
              className="back-link"
              aria-label={`Back to ${breadcrumbs[breadcrumbs.length - 2].name}`}
            >
              Back to {breadcrumbs[breadcrumbs.length - 2].name}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
