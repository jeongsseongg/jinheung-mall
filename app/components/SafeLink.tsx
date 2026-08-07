"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

type SafeLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};

export default function SafeLink({ href, onClick, ...props }: SafeLinkProps) {
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    event.stopPropagation();
    window.location.assign(href);
  };

  return <a href={href} onClick={navigate} {...props} />;
}
