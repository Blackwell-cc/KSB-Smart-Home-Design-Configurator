import styles from "./asset-placeholder.module.css";

type AssetPlaceholderProps = {
  type: "material" | "feature" | "preview" | "summary";
  testId?: string;
};

export function AssetPlaceholder({ type, testId }: AssetPlaceholderProps) {
  return (
    <span
      aria-hidden="true"
      className={styles.placeholder}
      data-placeholder-type={type}
      data-testid={testId}
    />
  );
}
