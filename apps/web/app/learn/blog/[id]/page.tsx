"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

function renderFormattedContent(raw: string) {
  const lines = raw.split(/\r?\n/);
  const nodes: JSX.Element[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let inCode = false;
  let code: string[] = [];

  const flushPara = () => {
    if (para.length) {
      nodes.push(
        <p key={`p-${nodes.length}`} className="leading-7 text-gray-800 mb-4 break-words">
          {para.join(" ")}
        </p>
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="list-disc pl-6 space-y-2 mb-4 text-gray-800 break-words">
          {list.map((item, idx) => (
            <li key={idx} className="break-words">{item}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  const flushCode = () => {
    if (code.length) {
      nodes.push(
        <pre
          key={`code-${nodes.length}`}
          className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4"
        >
          <code>{code.join("\n")}</code>
        </pre>
      );
      code = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        // closing block
        flushCode();
        inCode = false;
      } else {
        // opening block
        flushPara();
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      // list item
      if (para.length) flushPara();
      list.push(line.replace(/^\s*[-*]\s+/, ""));
      continue;
    } else if (line.trim() === "") {
      flushList();
      flushPara();
      continue;
    }

    // headings
    if (/^#\s+/.test(line)) {
      flushList();
      flushPara();
      nodes.push(
        <h2 key={`h2-${nodes.length}`} className="text-2xl font-semibold mt-8 mb-3 break-words">
          {line.replace(/^#\s+/, "")}
        </h2>
      );
    } else if (/^##\s+/.test(line)) {
      flushList();
      flushPara();
      nodes.push(
        <h3 key={`h3-${nodes.length}`} className="text-xl font-semibold mt-6 mb-2 break-words">
          {line.replace(/^##\s+/, "")}
        </h3>
      );
    } else if (/^###\s+/.test(line)) {
      flushList();
      flushPara();
      nodes.push(
        <h4 key={`h4-${nodes.length}`} className="text-lg font-semibold mt-4 mb-2 break-words">
          {line.replace(/^###\s+/, "")}
        </h4>
      );
    } else {
      para.push(line.trim());
    }
  }

  // flush leftovers
  flushCode();
  flushList();
  flushPara();

  return nodes;
}

export default function BlogArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const article = useQuery(api.learn.getBlog, { id: params.id });

  const contentNodes = useMemo(() => {
    if (!article?.content) return null;
    return renderFormattedContent(article.content);
  }, [article?.content]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => router.back()}
        >
          ← Back
        </button>
      </div>

      {!article ? (
        <div className="text-gray-600">Loading article...</div>
      ) : (
        <article className="bg-white border rounded-xl shadow-sm p-6 md:p-10 overflow-x-hidden">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            {article.title}
          </h1>
          <div className="flex items-center text-sm text-gray-600 mb-6">
            {article.authorAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.authorAvatarUrl}
                alt={article.authorName}
                className="w-9 h-9 rounded-full mr-3 object-cover border"
              />
            ) : null}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">{article.authorName}</span>
              <span className="text-gray-400">•</span>
              <span>{new Date(article.date).toLocaleDateString()}</span>
              <span className="text-gray-400">•</span>
              <span>{article.readTime}</span>
            </div>
          </div>

          <div className="space-y-1 mb-6">
            {article.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/learn?tag=${encodeURIComponent(tag)}`}
                className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2 hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="break-words">{contentNodes}</div>
        </article>
      )}
    </div>
  );
}
