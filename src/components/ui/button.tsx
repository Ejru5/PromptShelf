import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "tint";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,box-shadow,transform,color] duration-200 ease-(--ease-out-soft) active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/85",
  secondary: "bg-paper text-ink shadow-soft hover:shadow-lift",
  ghost: "text-ink-2 hover:bg-paper hover:text-ink",
  // Category-coloured: needs paletteVars() on the button or an ancestor.
  tint: "bg-tint text-deep hover:brightness-[0.97]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[0.9375rem]",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type CommonProps = { variant?: Variant; size?: Size; className?: string };

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: CommonProps & React.ComponentProps<"button">) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: CommonProps & React.ComponentProps<typeof Link>) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}

/** Round icon-only button. Always give it an accessible `label`. */
export function IconButton({
  label,
  variant = "ghost",
  size = "md",
  className,
  type = "button",
  children,
  ...props
}: { label: string; variant?: Variant; size?: Size } & React.ComponentProps<"button">) {
  const dims = { sm: "size-8", md: "size-10", lg: "size-12" }[size];
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(base, variants[variant], dims, "p-0", className)}
      {...props}
    >
      {children}
    </button>
  );
}
