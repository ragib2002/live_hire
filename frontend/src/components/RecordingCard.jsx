import { PlayIcon, CopyIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function RecordingCard({ recording, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recording.url);
      toast.success("Recording link copied!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recording?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recordings/${recording._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recording");
      }

      toast.success("Recording deleted successfully");
      onDelete(recording._id);
    } catch (error) {
      console.error("Error deleting recording:", error);
      toast.error("Failed to delete recording");
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColor =
    recording.status === "ready"
      ? "bg-green-100 text-green-700"
      : recording.status === "processing"
      ? "bg-blue-100 text-blue-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with status */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {recording.sessionId?.problem || "Unknown Problem"}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(recording.startTime)}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
            {recording.status}
          </span>
        </div>
      </div>

      {/* Video Preview Placeholder */}
      <div
        className="w-full aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center cursor-pointer hover:from-gray-800 hover:to-gray-700 transition-all"
        onClick={() => window.open(recording.url, "_blank")}
      >
        <div className="size-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <PlayIcon className="size-8 text-white" />
        </div>
      </div>

      {/* Info and Actions */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-sm">
            <p className="text-gray-600">Duration</p>
            <p className="font-semibold text-gray-900">
              {formatDuration(recording.duration)}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-gray-600">Difficulty</p>
            <p className="font-semibold text-gray-900 capitalize">
              {recording.sessionId?.difficulty || "—"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.open(recording.url, "_blank")}
            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center justify-center gap-2"
          >
            <PlayIcon className="size-4" />
            Play
          </button>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Copy link"
          >
            <CopyIcon className="size-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete recording"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordingCard;
