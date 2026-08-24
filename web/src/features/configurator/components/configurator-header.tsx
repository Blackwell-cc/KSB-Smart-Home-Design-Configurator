"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import styles from "./configurator-shell.module.css";

type ConfiguratorHeaderProps = {
  currentStep: number;
  onSave(): void;
  steps: readonly { id: string; label: string }[];
};

function HeaderIcon({ name }: { name: "help" | "save" }) {
  if (name === "help") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M9.8 9a2.3 2.3 0 1 1 3.7 1.8c-.9.65-1.5 1.1-1.5 2.2" /><path d="M12 16.8h.01" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 4.5h11l3 3V20H5z" /><path d="M8 4.5v5h8v-5M8 20v-6h8v6" /></svg>;
}

export function ConfiguratorHeader({ currentStep, onSave, steps }: ConfiguratorHeaderProps) {
  const [saved, setSaved] = useState(false);

  const showGuide = () => {
    const heading = document.getElementById("step-heading");
    heading?.scrollIntoView({ block: "center", behavior: "smooth" });
    heading?.focus();
  };

  const saveDraft = () => {
    onSave();
    setSaved(true);
  };

  return (
    <header className={styles.masthead}>
      <div className={styles.configuratorBrand}>
        <Link aria-label="KSB Architect หน้าแรก" className={styles.configuratorLogoFrame} href="/">
          <Image
            alt="KSB Architect"
            className={styles.configuratorLogo}
            fill
            preload
            sizes="132px"
            src="/brand/ksb-architect-logo.png"
          />
        </Link>
        <span className={styles.configuratorSubtitle}>SMART HOME DESIGN CONFIGURATOR</span>
      </div>
      <ProgressStepper currentStep={currentStep} steps={steps} />
      <div className={styles.headerUtilities}>
        <button onClick={showGuide} type="button"><HeaderIcon name="help" />คู่มือการใช้งาน</button>
        <button onClick={saveDraft} type="button"><HeaderIcon name="save" />{saved ? "บันทึกแล้ว" : "บันทึกแบบร่าง"}</button>
      </div>
    </header>
  );
}
