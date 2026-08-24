import { expect, test } from "vitest";
import { createDefaultConfiguration, projectDesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import { LeadSubmissionSchema } from "./lead";

const configuration = projectDesignBriefConfiguration({
  ...createDefaultConfiguration(),
  styleId: "contemporary-warm-luxury",
  residents: 3,
  provinceCode: "10",
});
const base = { configurationId: "11111111-1111-4111-8111-111111111111", idempotencyKey: "22222222-2222-4222-8222-222222222222", configuration, name: " Name ", preferredContactMethod: "phone", phone: "0812345678", email: "owner@example.test", consentAccepted: true, consentVersion: "project-contact-v1" };

test("accepts the complete full-report contact request and trims its text fields", () => {
  expect(LeadSubmissionSchema.parse({ ...base, lineId: "  owner.line  ", requestPurpose: "planning_to_build" })).toMatchObject({ name: "Name", phone: "0812345678", email: "owner@example.test", lineId: "owner.line", requestPurpose: "planning_to_build" });
});

test("accepts every stable request-purpose identifier", () => {
  for (const requestPurpose of ["view_full_report", "planning_to_build", "compare_options", "architect_consultation", "budget_planning", "design_service", "other"]) {
    expect(LeadSubmissionSchema.safeParse({ ...base, requestPurpose }).success).toBe(true);
  }
});

test("rejects missing contacts, invalid purpose, missing consent, and unknown body fields", () => {
  expect(LeadSubmissionSchema.safeParse({ ...base, phone: "", requestPurpose: "planning_to_build" }).success).toBe(false);
  expect(LeadSubmissionSchema.safeParse({ ...base, email: "invalid", requestPurpose: "planning_to_build" }).success).toBe(false);
  expect(LeadSubmissionSchema.safeParse({ ...base, requestPurpose: "thai-display-label" }).success).toBe(false);
  expect(LeadSubmissionSchema.safeParse({ ...base, requestPurpose: "planning_to_build", consentAccepted: false }).success).toBe(false);
  expect(LeadSubmissionSchema.safeParse({ ...base, requestPurpose: "planning_to_build", price: 1 }).success).toBe(false);
});
