import { useEffect, useState } from "react";

function useSessionRecordings(sessionId) {
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchRecordings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/recordings/session/${sessionId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch recordings");
        }

        const data = await response.json();
        setRecordings(data.recordings || []);
      } catch (err) {
        console.error("Error fetching session recordings:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [sessionId]);

  return { recordings, isLoading, error };
}

export default useSessionRecordings;
