import { expect, test } from "vitest";
import { createDefaultConfiguration, projectDesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import { LeadSubmissionSchema } from "./lead";

const configuration = projectDesignBriefConfiguration({
  ...createDefaultConfiguration(),
  styleId: "contemporary-warm-luxury",
  residents: 3,
  provinceCode: "10",
});
const base = { configurationId: "11111111-1111-4111-8111-111111111111", idempotencyKey: "22222222-2222-4222-8222-222222222222", configuration, name: " Name ", consentAccepted: true, consentVersion: "project-contact-v1" };

test("accepts one selected contact field and trims name", () => {
  expect(LeadSubmissionSchema.parse({ ...base, preferredContactMethod: "email", email: "owner@example.test" })).toMatchObject({ name: "Name", email: "owner@example.test" });
});

test("rejects unselected contact fields, missing consent, and unknown body fields", () => {
  expect(LeadSubmissionSchema.safeParse({ ...base, preferredContactMethod: "email", email: "owner@example.test", phone: "0812345678" }).success).toBe(false);
  expect(LeadSubmissionSchema.safeParse({ ...base, preferredContactMethod: "email", email: "owner@example.test", consentAccepted: false }).success).toBe(false);
  expect(LeadSubmissionSchema.safeParse({ ...base, preferredContactMethod: "email", email: "owner@example.test", price: 1 }).success).toBe(false);
});
