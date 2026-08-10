import { forwardRef, type ComponentPropsWithoutRef } from "react";

type FieldErrorProps = Omit<ComponentPropsWithoutRef<"p">, "role" | "tabIndex">;

export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(function FieldError(
  { children, ...props },
  ref,
) {
  return <p {...props} ref={ref} role="alert" tabIndex={-1}>{children}</p>;
});
