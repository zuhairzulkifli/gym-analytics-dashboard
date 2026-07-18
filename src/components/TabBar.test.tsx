import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import TabBar from "./TabBar";

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<TabBar />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("TabBar", () => {
  it("renders all five tabs", () => {
    renderWithRouter("/");
    for (const label of ["Today", "Train", "History", "Progress", "Settings"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("marks the active tab based on the current route", () => {
    renderWithRouter("/progress");
    expect(screen.getByText("Progress").closest("a")).toHaveAttribute("aria-current", "page");
  });
});
