import type { ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "ghost";
};

export function Button({ variant = "gold", className = "", ...props }: Props) {
  return <button className={`${styles.button} ${styles[variant]} ${className}`} {...props} />;
}
