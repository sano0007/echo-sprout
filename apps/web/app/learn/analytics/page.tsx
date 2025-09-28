'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Recharts = require('recharts') as typeof import('recharts');

export default function LearnAnalyticsPage() {
  const learningPaths = useQuery(api.learn.listLearningPaths);
  const views = useQuery(api.learn.totalPathsEntries);
  const engagement = useQuery(api.learn.engagementPercent);
  const totalUsers = useQuery((api as any).users.totalUsers, {});
  const reportTemplateRef = useRef<string | HTMLElement>('');

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultFromIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  }, []);

  const [viewsFromIso, setViewsFromIso] = useState<string>(defaultFromIso);
  const [viewsToIso, setViewsToIso] = useState<string>(todayIso);
  const [topicsFromIso, setTopicsFromIso] = useState<string>(defaultFromIso);
  const [topicsToIso, setTopicsToIso] = useState<string>(todayIso);
  const [viewsEngFromIso, setViewsEngFromIso] =
    useState<string>(defaultFromIso);
  const [viewsEngToIso, setViewsEngToIso] = useState<string>(todayIso);

  const viewsRange = useQuery(api.learn.viewsByDateRange, {
    from: viewsFromIso,
    to: viewsToIso,
  });
  const topicsRange = useQuery((api as any).forum.topicsByDateRange, {
    from: topicsFromIso,
    to: topicsToIso,
  });
  const viewsEngRange = useQuery(api.learn.viewsAndEngagementByRange, {
    from: viewsEngFromIso,
    to: viewsEngToIso,
  });
  const topByViews = useQuery(api.learn.pathsByViews);
  const topByEngagement = useQuery(api.learn.pathsByEngagement);
  const allTopics = useQuery((api as any).forum.listAllTopics, {});
  const contributors = useQuery((api as any).forum.replyContributors, {});

  const handleGeneratePdf = async () => {
    try {
      const root = document.getElementById('anal_id');
      if (!root) return;

      // Temporarily hide controls during capture (preserve layout with visibility)
      const toHide = root.querySelectorAll('[data-report-exclude]');
      const prevVisibility: string[] = [];
      toHide.forEach((el: Element, i) => {
        const style = (el as HTMLElement).style;
        prevVisibility[i] = style.visibility;
        style.visibility = 'hidden';
      });

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24; // page margin (pt)
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const spacing = 12; // space between stacked blocks

      // Select only top-level report blocks (exclude nested ones)
      const allBlocks = Array.from(
        root.querySelectorAll('[data-report-block]')
      ) as HTMLElement[];
      const blocks = allBlocks.filter(
        (el) => el.parentElement?.closest('[data-report-block]') === null
      );

      // Temporarily un-truncate long titles for capture
      const untruncateEls = root.querySelectorAll('[data-report-untruncate]');
      const prevOverflow: string[] = [];
      const prevTextOverflow: string[] = [];
      const prevWhiteSpace: string[] = [];
      untruncateEls.forEach((el: Element, i) => {
        const style = (el as HTMLElement).style;
        prevOverflow[i] = style.overflow;
        prevTextOverflow[i] = style.textOverflow as string;
        prevWhiteSpace[i] = style.whiteSpace as string;
        style.overflow = 'visible';
        style.textOverflow = 'clip';
        style.whiteSpace = 'normal';
      });

      if (blocks.length === 0) {
        // Fallback to whole-page capture (should be rare now)
        const canvas = await html2canvas(root, {
          useCORS: true,
          logging: false,
          background: '#ffffff',
          width: root.scrollWidth,
          height: root.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = margin;
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
        heightLeft -= contentHeight;

        const overlap = 24;
        while (heightLeft > 0) {
          pdf.addPage();
          position = margin + (heightLeft - imgHeight + overlap);
          pdf.addImage(
            imgData,
            'PNG',
            margin,
            position,
            imgWidth,
            imgHeight,
            undefined,
            'FAST'
          );
          heightLeft -= contentHeight - overlap;
        }
      } else {
        // Capture each block individually and stack them without breaking inside a block
        let y = margin;
        for (const node of Array.from(blocks)) {
          const el = node as HTMLElement;
          const containsSvg = !!el.querySelector('svg');
          const isHeaderBlock = !!el.querySelector('h1');

          // Add tiny padding to header to avoid top/bottom clipping during capture
          let prevPaddingTop: string | undefined;
          let prevPaddingBottom: string | undefined;
          if (isHeaderBlock) {
            prevPaddingTop = el.style.paddingTop;
            prevPaddingBottom = el.style.paddingBottom;
            el.style.paddingTop = '16px';
            el.style.paddingBottom = '12px';
          }

          // Compute size AFTER padding adjustments
          const w = el.scrollWidth || el.clientWidth;
          const h = el.scrollHeight || el.clientHeight;

          const canvas = await html2canvas(el, {
            useCORS: true,
            logging: false,
            background: '#ffffff',
            width: w,
            height: h,
          });

          // Restore padding
          if (isHeaderBlock) {
            el.style.paddingTop = prevPaddingTop ?? '';
            el.style.paddingBottom = prevPaddingBottom ?? '';
          }
          const imgData = canvas.toDataURL('image/png');
          const naturalWidth = canvas.width;
          const naturalHeight = canvas.height;

          const renderWidth = contentWidth;
          const renderHeight = (naturalHeight * renderWidth) / naturalWidth;

          // If block taller than a page, scale it down to fit a single page to avoid slicing inside the block
          const scaleFactor = Math.min(1, contentHeight / renderHeight);
          const finalWidth = renderWidth * scaleFactor;
          const finalHeight = renderHeight * scaleFactor;

          // New page if this block doesn't fit on current page
          if (y + finalHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }

          pdf.addImage(
            imgData,
            'PNG',
            margin,
            y,
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
          );
          y += finalHeight + spacing;
        }
      }

      // Restore un-truncation styles
      untruncateEls.forEach((el: Element, i) => {
        const style = (el as HTMLElement).style;
        style.overflow = prevOverflow[i] ?? '';
        style.textOverflow = prevTextOverflow[i] ?? '' as any;
        style.whiteSpace = prevWhiteSpace[i] ?? '' as any;
      });

      // Restore control visibility
      toHide.forEach((el: Element, i) => {
        (el as HTMLElement).style.visibility = prevVisibility[i] ?? '';
      });

      pdf.save(`learn-analytics-report-${todayIso}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

