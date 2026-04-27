"use client";

import { useState } from "react";

type Props = {
  text: string;
  maxLength?: number;
};

export default function ExpandableText({ text, maxLength = 120 }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > maxLength;

  const displayText = expanded
    ? text
    : text.slice(0, maxLength) + (isLong ? "..." : "");

  return (
    <p className="text-lg">
      {displayText}

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-2 text-blue-600 font-medium hover:underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </p>
  );
}