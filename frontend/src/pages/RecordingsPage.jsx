import { useEffect, useState } from "react";
import RecordingCard from "../components/RecordingCard";
import LoaderUI from "../components/Navbar"; // Placeholder - adjust import as needed

function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/recordings");

      if (!response.ok) {
        throw new Error("Failed to fetch recordings");
      }

      const data = await response.json();
      setRecordings(data.recordings || []);
    } catch (err) {
      console.error("Error fetching recordings:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (recordingId) => {
    setRecordings(recordings.filter(r => r._id !== recordingId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading recordings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Recordings</h1>
          <p className="text-lg text-gray-600">
            {recordings.length} {recordings.length === 1 ? "recording" : "recordings"} available
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold">Error loading recordings</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Recordings Grid */}
        {recordings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map((recording) => (
              <RecordingCard
                key={recording._id}
                recording={recording}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900 mb-2">
                No recordings yet
              </p>
              <p className="text-gray-600">
                Recordings from your coding sessions will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecordingsPage;
