import type { AnchorHTMLAttributes } from "react";

type SafeLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};

export default function SafeLink({ href, ...props }: SafeLinkProps) {
  return <a href={href} {...props} />;
}
