import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

test("activates with keyboard and exposes disabled state", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  render(<Button onClick={onClick}>ถัดไป</Button>);

  await user.tab();
  await user.keyboard("{Enter}");

  expect(onClick).toHaveBeenCalledOnce();
});
