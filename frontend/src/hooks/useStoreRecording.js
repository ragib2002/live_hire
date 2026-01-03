import { useState, useCallback } from "react";

function useStoreRecording() {
  const [isStoring, setIsStoring] = useState(false);
  const [error, setError] = useState(null);

  const storeRecording = useCallback(async (sessionId, streamCallId) => {
    try {
      setIsStoring(true);
      setError(null);

      const response = await fetch("/api/recordings/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          streamCallId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to store recording");
      }

      const data = await response.json();
      return data.recording;
    } catch (err) {
      console.error("Error storing recording:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsStoring(false);
    }
  }, []);

  return { storeRecording, isStoring, error };
}

export default useStoreRecording;
