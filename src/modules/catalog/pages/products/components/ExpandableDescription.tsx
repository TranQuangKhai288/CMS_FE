import React, { useState } from "react";

const ExpandableDescription = ({ content }: { content: any }) => {
  const [expanded, setExpanded] = useState(false);

  if (!content) return null;

  return (
    <div className="relative group">
      {/* Container chứa nội dung */}
      <div
        className={`text-sm text-gray-600 overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          expanded ? "max-h-250" : "max-h-10"
        }`}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Hiệu ứng mờ dần (Gradient Fade) - Chỉ hiện khi đang thu gọn */}
      {!expanded && (
        <div className="absolute bottom-0 left-0 w-full h-8 pointer-events-none" />
      )}

      {/* Nút bấm */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 font-semibold focus:outline-none transition-colors"
      >
        {expanded ? "Thu gọn" : "Xem thêm"}
      </button>
    </div>
  );
};

export default ExpandableDescription;
