import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

test("activates with keyboard", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  render(<Button onClick={onClick}>ถัดไป</Button>);

  await user.tab();
  await user.keyboard("{Enter}");

  expect(onClick).toHaveBeenCalledOnce();
});

test("does not submit its parent form by default", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());

  render(
    <form onSubmit={onSubmit}>
      <Button>ถัดไป</Button>
    </form>,
  );

  await user.click(screen.getByRole("button", { name: "ถัดไป" }));

  expect(onSubmit).not.toHaveBeenCalled();
});

test("submits its parent form when type submit is explicit", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());

  render(
    <form onSubmit={onSubmit}>
      <Button type="submit">ส่งข้อมูล</Button>
    </form>,
  );

  await user.click(screen.getByRole("button", { name: "ส่งข้อมูล" }));

  expect(onSubmit).toHaveBeenCalledOnce();
});

test("exposes native disabled semantics and prevents activation", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  render(
    <Button disabled onClick={onClick}>
      ถัดไป
    </Button>,
  );

  const button = screen.getByRole("button", { name: "ถัดไป" });
  expect(button).toBeDisabled();

  await user.click(button);

  expect(onClick).not.toHaveBeenCalled();
});
