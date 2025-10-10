function previewLearnText(input: string, max = 50) {
  if (!input) return '';
  const text = input.replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max).trimEnd() + '.....' : text;
}

export { previewLearnText };
