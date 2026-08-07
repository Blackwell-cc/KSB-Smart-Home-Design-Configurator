import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChoiceCard } from "./choice-card";

test("communicates selected state with a pressed button and visible text", () => {
  render(<ChoiceCard selected title="Contemporary Warm Luxury" />);

  expect(screen.getByRole("button", { name: /Contemporary Warm Luxury เลือกแล้ว/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("does not submit its parent form by default", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());

  render(
    <form onSubmit={onSubmit}>
      <ChoiceCard title="Contemporary Warm Luxury" />
    </form>,
  );

  await user.click(screen.getByRole("button", { name: /Contemporary Warm Luxury ยังไม่ได้เลือก/ }));

  expect(onSubmit).not.toHaveBeenCalled();
});

test("keeps selected accessibility state when conflicting ARIA props are supplied", () => {
  render(
    <ChoiceCard
      aria-label="ยังไม่ได้เลือก"
      aria-pressed={false}
      selected
      title="Contemporary Warm Luxury"
    />,
  );

  expect(screen.getByRole("button", { name: /Contemporary Warm Luxury เลือกแล้ว/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
