import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Annotation } from "@/components/ui/annotation";
import { BookCover, CoverCard } from "@/components/ui/book-cover";
import { Button, IconButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { FolderTabCard } from "@/components/ui/folder-tab";
import { CategoryTag } from "@/components/ui/pill";
import { PromptText } from "@/components/ui/prompt-text";
import { SpecTable } from "@/components/ui/spec-table";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { getCategoryDef } from "@/config/categories";

const palette = getCategoryDef("images")!.palette;

describe("PromptText", () => {
  it("highlights each blank and keeps the surrounding text", () => {
    const { container } = render(<PromptText template="A {{subject}} on {{place_name}}." />);
    const marks = container.querySelectorAll("mark[data-blank]");
    expect([...marks].map((m) => m.getAttribute("data-blank"))).toEqual(["subject", "place_name"]);
    expect(marks[1].textContent).toBe("place name");
    expect(container.textContent).toBe("A subject on place name.");
  });

  it("shows filled values inside the highlight", () => {
    const { container } = render(
      <PromptText template="A {{subject}}" values={{ subject: "red fox" }} />,
    );
    expect(container.querySelector("mark")?.textContent).toBe("red fox");
  });
});

describe("SpecTable", () => {
  it("renders label/value pairs as a definition list", () => {
    render(
      <SpecTable
        items={[
          { label: "Model", value: "Veo 3" },
          { label: "Duration", value: "8s" },
        ]}
      />,
    );
    const terms = screen.getAllByRole("term").map((t) => t.textContent);
    const defs = screen.getAllByRole("definition").map((d) => d.textContent);
    expect(terms).toEqual(["Model", "Duration"]);
    expect(defs).toEqual(["Veo 3", "8s"]);
  });

  it("renders nothing without items", () => {
    const { container } = render(<SpecTable items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("FolderTabCard", () => {
  it("makes the title the card's single link when href is set", () => {
    render(
      <FolderTabCard palette={palette} title="Discovery" href="/p/discovery">
        Understanding your brand.
      </FolderTabCard>,
    );
    const article = screen.getByRole("article");
    const links = within(article).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/p/discovery");
    expect(links[0]).toHaveTextContent("Discovery");
  });

  it("has no link without href and applies the palette variables", () => {
    render(<FolderTabCard palette={palette} title="Static" />);
    const article = screen.getByRole("article");
    expect(within(article).queryByRole("link")).toBeNull();
    expect(article.style.getPropertyValue("--tint")).toBe(palette.tint);
  });
});

describe("CoverCard / BookCover", () => {
  it("links the title and shows the access status", () => {
    render(
      <CoverCard
        href="/collections/starter"
        title="Starter pack"
        status="Free"
        cover={<BookCover color="#2A80EB" title="Starter pack" />}
      />,
    );
    expect(screen.getByRole("link", { name: "Starter pack" })).toHaveAttribute(
      "href",
      "/collections/starter",
    );
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("picks light text on dark covers and dark text on light covers", () => {
    const { container, rerender } = render(<BookCover color="#141414" />);
    expect(container.firstElementChild).toHaveClass("text-white");
    rerender(<BookCover color="#FDF5DA" />);
    expect(container.firstElementChild).toHaveClass("text-ink");
  });
});

describe("Buttons, tags, annotation, empty state", () => {
  it("Button defaults to type=button; IconButton has an accessible name", () => {
    render(
      <>
        <Button>Go</Button>
        <IconButton label="Save prompt">♥</IconButton>
      </>,
    );
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "Save prompt" })).toBeInTheDocument();
  });

  it("CategoryTag links to its shelf and ignores unknown slugs", () => {
    const { container } = render(
      <>
        <CategoryTag slug="video" />
        <CategoryTag slug="nope" />
      </>,
    );
    expect(screen.getByRole("link", { name: "Video" })).toHaveAttribute("href", "/shelves/video");
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("Annotation is decorative (hidden from assistive tech)", () => {
    const { container } = render(<Annotation>note</Annotation>);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("EmptyState renders title, body and action", () => {
    render(
      <EmptyState title="Nothing here" action={<button>Browse</button>}>
        Body copy
      </EmptyState>,
    );
    expect(screen.getByRole("heading", { name: "Nothing here" })).toBeInTheDocument();
    expect(screen.getByText("Body copy")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Browse" })).toBeInTheDocument();
  });
});

describe("Toast", () => {
  function Trigger() {
    const toast = useToast();
    return <button onClick={() => toast("copied!", { variant: "note", duration: 1000 })}>t</button>;
  }

  it("announces a toast and removes it after its duration", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "t" }));
    const region = screen.getByRole("status");
    expect(within(region).getByText("copied!")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1100));
    expect(within(region).queryByText("copied!")).toBeNull();
    vi.useRealTimers();
  });

  it("throws a helpful error outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Trigger />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
