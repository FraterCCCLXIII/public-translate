import React from "react";

interface PunctuateTextProps {
  text: string;
}

// Always capitalize the first word and add a period at the end if missing
function punctuate(text: string): string {
  if (!text) return "";
  // Trim and collapse spaces
  let s = text.trim().replace(/\s+/g, " ");
  // Capitalize the first word (not just the first letter)
  s = s.replace(/^(\w)(\w*)/, (match, first, rest) => first.toUpperCase() + rest);
  // Add period if missing at end
  if (!/[.!?]$/.test(s)) s += ".";
  // Capitalize after periods (simple heuristic)
  s = s.replace(/([.!?]\s+)([a-z])/g, (m, sep, char) => sep + char.toUpperCase());
  return s;
}

const PunctuateText: React.FC<PunctuateTextProps> = ({ text }) => {
  return <span>{punctuate(text)}</span>;
};

export default PunctuateText; 