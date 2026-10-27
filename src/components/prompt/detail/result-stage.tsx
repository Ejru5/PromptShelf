import type { Prompt, Result } from "@/content/schema";
import { BeforeAfter } from "@/components/viewers/before-after";
import { CodeOutput } from "@/components/viewers/code-output";
import { DocumentViewer } from "@/components/viewers/document-viewer";
import { ImageViewer } from "@/components/viewers/image-viewer";
import { ResultSwitcher, type SwitcherItem } from "@/components/viewers/result-switcher";
import { TextOutput } from "@/components/viewers/text-output";
import { UiPreview } from "@/components/viewers/ui-preview";
import { VideoPlayer } from "@/components/viewers/video-player";
import { Morph } from "../morph";
import { ResultImage } from "../result-image";

const KIND_LABEL: Record<Result["kind"], string> = {
  image: "Image",
  "before-after": "Before / after",
  video: "Video",
  ui: "Live component",
  document: "Document",
  text: "Output",
  code: "Code",
};

function Viewer({ result, prompt, first }: { result: Result; prompt: Prompt; first: boolean }) {
  switch (result.kind) {
    case "image":
      return <ImageViewer media={result.image} alt={result.alt} preload={first} />;
    case "before-after":
      return (
        <BeforeAfter
          before={result.before}
          after={result.after}
          alt={result.alt}
          beforeLabel={result.beforeLabel}
          afterLabel={result.afterLabel}
          preload={first}
        />
      );
    case "video":
      return (
        <VideoPlayer
          src={result.video.src}
          type={result.video.type}
          poster={result.poster?.src}
          width={result.video.width}
          height={result.video.height}
          duration={result.video.duration}
          fallback={result.video.fallback}
          label={result.alt}
        />
      );
    case "ui":
      return (
        <UiPreview
          html={result.html}
          height={result.height}
          thumbnail={result.thumbnail}
          title={prompt.title}
          code={
            <CodeOutput
              code={result.html}
              language="html"
              filename="component.html"
              rounded={false}
              maxHeight={640}
            />
          }
        />
      );
    case "document":
      return (
        <DocumentViewer
          pages={result.pages}
          pdf={result.pdf}
          alt={result.alt}
          title={prompt.title}
        />
      );
    case "text":
      return <TextOutput markdown={result.markdown} />;
    case "code":
      return (
        <CodeOutput code={result.code} language={result.language} filename={result.filename} />
      );
  }
}

function thumbOf(result: Result) {
  const media =
    result.kind === "image"
      ? result.image
      : result.kind === "before-after"
        ? result.after
        : result.kind === "video"
          ? result.poster
          : result.kind === "ui"
            ? result.thumbnail
            : result.kind === "document"
              ? result.pages[0]
              : undefined;
  return media ? <ResultImage media={media} alt="" fill sizes="28px" /> : undefined;
}

function captionOf(result: Result, i: number, total: number) {
  const parts = [
    total > 1 ? `Result ${i + 1} of ${total}` : "Sample result",
    result.model,
    result.caption,
  ].filter(Boolean);
  return parts.join(" · ");
}

/** All of a prompt's results, each in the viewer that suits it. */
export function ResultStage({ prompt }: { prompt: Prompt }) {
  if (prompt.results.length === 0) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-card border border-dashed border-line-2 text-sm text-ink-3">
        No sample result yet
      </div>
    );
  }
  const items: SwitcherItem[] = prompt.results.map((r, i) => ({
    id: `${prompt.slug}-${i}`,
    label: r.caption ?? `${KIND_LABEL[r.kind]} ${prompt.results.length > 1 ? i + 1 : ""}`.trim(),
    caption: captionOf(r, i, prompt.results.length),
    thumb: thumbOf(r),
    node: (
      <>
        <Morph slug={prompt.slug} enabled={i === 0}>
          <div>
            <Viewer result={r} prompt={prompt} first={i === 0} />
          </div>
        </Morph>
        {r.placeholder && process.env.NODE_ENV === "development" ? (
          <p className="mt-2 inline-flex rounded-full bg-[#FDE68A] px-2.5 py-0.5 text-[0.6875rem] font-medium text-ink">
            Placeholder result — replace with a real output (dev only)
          </p>
        ) : null}
      </>
    ),
  }));
  return <ResultSwitcher items={items} />;
}
