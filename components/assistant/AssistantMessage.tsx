"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  strong: ({ children }) => (
    <span className="font-sans font-bold text-zinc-100 uppercase">{children}</span>
  ),
  em: ({ children }) => (
    <em className="font-sans font-medium text-zinc-300">{children}</em>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside font-sans text-md">{children}</ol>
  ),
  ul: ({ children }) => <ul className="list-disc list-inside font-sans m-0 text-md">{children}</ul>,
  li: ({ children }) => <li className="font-sans text-md">{children}</li>,
  p: ({ children }) => <span className="font-sans text-md">{children}</span>,
  table: ({ children }) => (
    <div className="my-4 w-full overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-left font-sans text-sm text-zinc-300">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-zinc-800/60 border-b border-zinc-100 text-xs uppercase text-zinc-100">
      {children}
    </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-zinc-100 bg-zinc-900/40">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="transition-colors hover:bg-zinc-500">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 font-bold text-center text-zinc-100">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 align-middle text-center text-zinc-300">
        {children}
      </td>
    ),
};

interface AssistantMessageProps {
  content: string;
}

export function AssistantMessage({ content }: AssistantMessageProps) {
  return (
    <div className="prose-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}