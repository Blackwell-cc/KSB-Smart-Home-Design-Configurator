import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("explains the free preview before asking for contact data", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { name: /เธฃเธนเนเธเธทเนเธเธ—เธตเนเนเธฅเธฐเธเธเธเธฃเธฐเธกเธฒเธ“เธเนเธฒเธเธเนเธญเธเน€เธฃเธดเนเธกเธชเธฃเนเธฒเธ/ })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "เน€เธฃเธดเนเธกเธญเธญเธเนเธเธเธเนเธฒเธ" })).toHaveAttribute("href", "/configurator");
  expect(screen.getByText(/เธ”เธน Preview เนเธ”เนเนเธ”เธขเนเธกเนเธ•เนเธญเธเธเธฃเธญเธเธเนเธญเธกเธนเธฅเธชเนเธงเธเธ•เธฑเธง/)).toBeInTheDocument();
});
