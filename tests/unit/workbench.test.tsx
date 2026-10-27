import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PromptWorkbench } from "@/components/prompt/detail/prompt-workbench";
import { ToastProvider } from "@/components/ui/toast";
import type { Blank } from "@/content/schema";

const blanks: Blank[] = [
  { name: "subject", label: "Subject", default: "a red fox" },
  { name: "light", label: "Light", default: "golden hour", options: ["golden hour", "blue hour"] },
  { name: "mood", label: "Mood" },
];
const template = "A photo of {{subject}} at {{light}}, feeling {{mood}}.";

function setup(models = ["Midjourney v7"]) {
  // userEvent.setup() installs its own clipboard stub, so create it first and mock after.
  const user = userEvent.setup();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
  render(
    <ToastProvider>
      <PromptWorkbench
        slug="test-prompt"
        title="Test"
        template={template}
        blanks={blanks}
        models={models}
      />
    </ToastProvider>,
  );
  return { writeText, user };
}

beforeEach(() => localStorage.clear());

describe("PromptWorkbench", () => {
  it("shows defaults in the chips and counts filled blanks", () => {
    setup();
    const text = screen.getByTestId("prompt-text");
    expect(within(text).getByRole("button", { name: /edit subject$/ })).toHaveTextContent(
      "a red fox",
    );
    expect(within(text).getByRole("button", { name: /edit mood$/ })).toHaveTextContent("mood");
    expect(screen.getByText("2/3 blanks filled")).toBeInTheDocument();
  });

  it("updates the prompt live as you type and copies the filled version", async () => {
    const { writeText, user } = setup();
    await user.type(screen.getByLabelText("Mood"), "calm");
    await user.selectOptions(screen.getByLabelText("Light"), "blue hour");
    expect(screen.getByRole("button", { name: /edit mood$/ })).toHaveTextContent("calm");
    expect(screen.getByText("3/3 blanks filled")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Copy prompt/ }));
    expect(writeText).toHaveBeenCalledWith("A photo of a red fox at blue hour, feeling calm.");
    expect(await screen.findByText("copied! go make something ↗")).toBeInTheDocument();
  });

  it("keeps unfilled blanks visible in the copy and says how many are left", async () => {
    const { writeText, user } = setup();
    await user.click(screen.getByRole("button", { name: /Copy prompt/ }));
    expect(writeText).toHaveBeenCalledWith(
      "A photo of a red fox at golden hour, feeling {{mood}}.",
    );
    expect(await screen.findByText("copied! 1 blank left as {{…}}")).toBeInTheDocument();
  });

  it("copies the original template from the menu", async () => {
    const { writeText, user } = setup();
    await user.click(screen.getByRole("button", { name: "More copy options" }));
    await user.click(screen.getByRole("menuitem", { name: /Copy original template/ }));
    expect(writeText).toHaveBeenCalledWith(template);
  });

  it("clicking a chip focuses its field; Reset restores defaults", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /edit subject$/ }));
    expect(screen.getByLabelText("Subject")).toHaveFocus();
    await user.clear(screen.getByLabelText("Subject"));
    await user.type(screen.getByLabelText("Subject"), "an owl");
    await user.click(screen.getByRole("button", { name: /Reset/ }));
    expect(screen.getByLabelText("Subject")).toHaveValue("a red fox");
  });

  it("remembers values per prompt in this browser", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Mood"), "wistful");
    expect(JSON.parse(localStorage.getItem("promptshelf:blanks:test-prompt")!)).toMatchObject({
      mood: "wistful",
    });
  });

  it("restores saved values on mount", () => {
    localStorage.setItem(
      "promptshelf:blanks:test-prompt",
      JSON.stringify({ mood: "stormy", unknown: "x" }),
    );
    setup();
    expect(screen.getByLabelText("Mood")).toHaveValue("stormy");
  });

  it("C copies when not typing, but not while typing in a field", async () => {
    const { writeText, user } = setup();
    await act(async () => {
      fireEvent.keyDown(window, { key: "c" });
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    await user.type(screen.getByLabelText("Mood"), "c");
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it("offers Open in Claude / ChatGPT only for chat models, with the filled prompt", () => {
    setup(["Claude", "ChatGPT"]);
    const claude = screen.getByRole("link", { name: /Open in Claude/ });
    expect(claude.getAttribute("href")).toBe(
      `https://claude.ai/new?q=${encodeURIComponent("A photo of a red fox at golden hour, feeling {{mood}}.")}`,
    );
    expect(screen.getByRole("link", { name: /Open in ChatGPT/ })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("hides Open in links for image models", () => {
    setup(["Midjourney v7"]);
    expect(screen.queryByRole("link", { name: /Open in/ })).toBeNull();
  });
});
