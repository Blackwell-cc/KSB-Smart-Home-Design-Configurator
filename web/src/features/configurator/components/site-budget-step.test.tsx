import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import { SiteBudgetStep } from "./site-budget-step";

describe("SiteBudgetStep province search", () => {
  test("filters Thai province names and selects the requested province", async () => {
    const user = userEvent.setup();
    const configuration = createDefaultConfiguration();
    const onChange = vi.fn();

    render(<SiteBudgetStep configuration={configuration} onChange={onChange} />);

    const province = screen.getByRole("combobox", { name: "จังหวัด" });
    await user.click(province);
    await user.type(province, "เชียง");

    const results = screen.getByRole("listbox", { name: "รายชื่อจังหวัด" });
    expect(within(results).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "เชียงใหม่",
      "เชียงราย",
    ]);

    await user.click(within(results).getByRole("option", { name: "เชียงใหม่" }));

    expect(province).toHaveValue("เชียงใหม่");
    expect(onChange).toHaveBeenLastCalledWith({ provinceCode: "50" });
  });

  test("supports keyboard selection and reports when no province matches", async () => {
    const user = userEvent.setup();
    const configuration = createDefaultConfiguration();
    const onChange = vi.fn();

    render(<SiteBudgetStep configuration={configuration} onChange={onChange} />);

    const province = screen.getByRole("combobox", { name: "จังหวัด" });
    await user.type(province, "ภูเก็ต");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({ provinceCode: "83" });

    await user.clear(province);
    await user.type(province, "ไม่มีจังหวัดนี้");
    expect(screen.getByText("ไม่พบจังหวัดที่ค้นหา")).toBeVisible();
  });
});

describe("SiteBudgetStep access dropdown", () => {
  test("opens a styled list and selects an access condition", async () => {
    const user = userEvent.setup();
    const configuration = createDefaultConfiguration();
    const onChange = vi.fn();

    const view = render(<SiteBudgetStep configuration={configuration} onChange={onChange} />);

    const access = screen.getByRole("combobox", { name: "สภาพการเข้าถึงหน้างาน" });
    await user.click(access);

    const options = screen.getByRole("listbox", { name: "ตัวเลือกสภาพการเข้าถึงหน้างาน" });
    expect(within(options).getAllByRole("option")).toHaveLength(3);
    await user.click(within(options).getByRole("option", { name: "ถนนค่อนข้างแคบ" }));

    view.rerender(<SiteBudgetStep configuration={{ ...configuration, siteAccess: "restricted" }} onChange={onChange} />);
    expect(access).toHaveTextContent("ถนนค่อนข้างแคบ");
    expect(onChange).toHaveBeenLastCalledWith({ siteAccess: "restricted" });
  });

  test("supports keyboard selection without a search field", async () => {
    const user = userEvent.setup();
    const configuration = createDefaultConfiguration();
    const onChange = vi.fn();

    render(<SiteBudgetStep configuration={configuration} onChange={onChange} />);

    const access = screen.getByRole("combobox", { name: "สภาพการเข้าถึงหน้างาน" });
    access.focus();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenLastCalledWith({ siteAccess: "restricted" });
    expect(screen.queryByRole("listbox", { name: "ตัวเลือกสภาพการเข้าถึงหน้างาน" })).not.toBeInTheDocument();
  });
});
