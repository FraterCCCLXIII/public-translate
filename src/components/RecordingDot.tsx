
import React from "react";

const RecordingDot = ({
  recording,
  visible,
}: {
  recording: boolean;
  visible: boolean;
}) =>
  recording && !visible ? (
    <div className="fixed left-4 bottom-4 z-50">
      <span className="block w-3 h-3 rounded-full bg-red-600 shadow-lg animate-pulse" aria-label="Recording indicator" />
    </div>
  ) : null;

export default RecordingDot;
