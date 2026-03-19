import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 scroll-mt-20 border-b border-border pb-2 text-xl font-semibold text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 text-lg font-semibold text-foreground">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-muted-foreground leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 ps-6 text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 ps-6 text-muted-foreground">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  a: ({ href, children }) => {
    const openInNewTab = href?.startsWith("http") ?? false;
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-4 hover:no-underline"
        {...(openInNewTab
          ? { target: "_blank", rel: "noopener noreferrer" as const }
          : { rel: undefined })}
      >
        {children}
      </a>
    );
  },
  hr: () => <hr className="my-8 border-border" />,
};

interface LegalMarkdownBodyProps {
  content: string;
}

export function LegalMarkdownBody({ content }: LegalMarkdownBodyProps) {
  return (
    <div className="legal-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
