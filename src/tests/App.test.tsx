import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("App Component", () => {
  it("should render without crashing", () => {
    render(<App />);

    // App should render successfully
    expect(document.body).toBeTruthy();
  });
});
