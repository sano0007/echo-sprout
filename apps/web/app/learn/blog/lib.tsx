'use client';

import type React from 'react';

function renderFormattedContent(raw: string) {
  const lines = raw.split(/\r?\n/);
  const nodes: React.JSX.Element[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let inCode = false;
  let code: string[] = [];

  const flushPara = () => {
    if (para.length) {
      nodes.push(
        <p
          key={`p-${nodes.length}`}
          className="leading-7 text-gray-800 mb-4 break-words"
        >
          {para.join(' ')}
        </p>
      );
      para = [];
    }
  };

  const flushList = () => {
    if (list.length) {
      nodes.push(
        <ul
          key={`ul-${nodes.length}`}
          className="list-disc pl-6 space-y-2 mb-4 text-gray-800 break-words"
        >
          {list.map((item, idx) => (
            <li key={idx} className="break-words">
              {item}
            </li>
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
          <code>{code.join('\n')}</code>
        </pre>
      );
      code = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
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
      if (para.length) flushPara();
      list.push(line.replace(/^\s*[-*]\s+/, ''));
      continue;
    }

    if (line.trim() === '') {
      flushList();
      flushPara();
      continue;
    }

    if (/^#\s+/.test(line)) {
      flushList();
      flushPara();
      nodes.push(
        <h2
          key={`h2-${nodes.length}`}
          className="text-2xl font-semibold mt-8 mb-3 break-words"
        >
          {line.replace(/^#\s+/, '')}
        </h2>
      );
    } else if (/^##\s+/.test(line)) {
      flushList();
      flushPara();
      nodes.push(
        <h3
          key={`h3-${nodes.length}`}
          className="text-xl font-semibold mt-6 mb-2 break-words"
        >
          {line.replace(/^##\s+/, '')}
        </h3>
      );
    } else if (/^###\s+/.test(line)) {
      flushList();
      flushPara();
      nodes.push(
        <h4
          key={`h4-${nodes.length}`}
          className="text-lg font-semibold mt-4 mb-2 break-words"
        >
          {line.replace(/^###\s+/, '')}
        </h4>
      );
    } else {
      para.push(line.trim());
    }
  }

  flushCode();
  flushList();
  flushPara();

  return nodes;
}

export { renderFormattedContent };
