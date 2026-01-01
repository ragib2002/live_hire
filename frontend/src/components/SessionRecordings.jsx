import { useState } from "react";
import {
  PlayCircleIcon,
  Video,
  Clock,
  Users,
  Trophy,
  Loader,
  ChevronDownIcon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";

function SessionRecordings({ recordings, isLoading }) {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);

  if (isLoading) {
    return (
      <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/30 mt-8">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-secondary to-accent rounded-xl">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black">Session Recordings</h2>
          </div>
          <div className="flex items-center justify-center py-20">
            <Loader className="w-10 h-10 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!recordings || recordings.length === 0) {
    return (
      <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/30 mt-8">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-secondary to-accent rounded-xl">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black">Session Recordings</h2>
          </div>
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-3xl flex items-center justify-center">
              <Trophy className="w-10 h-10 text-secondary/50" />
            </div>
            <p className="text-lg font-semibold opacity-70 mb-1">No recordings yet</p>
            <p className="text-sm opacity-50">
              Complete sessions will have recordings available here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/30 mt-8">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-secondary to-accent rounded-xl">
            <Video className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-black">Session Recordings</h2>
          <span className="badge badge-secondary ml-auto">{recordings.length}</span>
        </div>

        <div className="space-y-4">
          {recordings.map((recording) => (
            <div
              key={recording._id}
              className="border border-base-300 rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              {/* Recording Card Header */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === recording._id ? null : recording._id)
                }
                className="w-full flex items-center gap-4 p-4 hover:bg-base-200 transition-colors"
              >
                {/* Video Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                    <PlayCircleIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-success text-success-content text-xs font-bold px-2 py-1 rounded-full">
                    Recorded
                  </div>
                </div>

                {/* Recording Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg truncate">{recording.problem}</h3>
                    <span
                      className={`badge badge-sm ${getDifficultyBadgeClass(
                        recording.difficulty
                      )}`}
                    >
                      {recording.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm opacity-75">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatDistanceToNow(new Date(recording.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>
                        {(recording.participants?.length || 0) + 1}{" "}
                        {(recording.participants?.length || 0) + 1 > 1
                          ? "participants"
                          : "participant"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand Button */}
                <ChevronDownIcon
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    expandedId === recording._id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded Content */}
              {expandedId === recording._id && (
                <div className="border-t border-base-300 p-4 bg-base-50">
                  {/* Host Info */}
                  <div className="mb-4">
                    <p className="text-sm opacity-60 mb-2">Hosted by</p>
                    <div className="flex items-center gap-3">
                      {recording.host?.profileImage ? (
                        <img
                          src={recording.host.profileImage}
                          alt={recording.host.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                          {recording.host?.name?.charAt(0) || "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{recording.host?.name}</p>
                        <p className="text-xs opacity-60">{recording.host?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  {recording.participants && recording.participants.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm opacity-60 mb-2">
                        Participants ({recording.participants.length})
                      </p>
                      <div className="space-y-2">
                        {recording.participants.map((participant) => (
                          <div key={participant._id} className="flex items-center gap-3">
                            {participant.profileImage ? (
                              <img
                                src={participant.profileImage}
                                alt={participant.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                {participant.name?.charAt(0) || "?"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{participant.name}</p>
                              <p className="text-xs opacity-60">{participant.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Watch Recording Button */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-base-300">
                    {recording.recording?.recordingUrl ? (
                      <>
                        <button
                          onClick={() => setSelectedRecording(recording)}
                          className="btn btn-primary btn-sm gap-2 flex-1"
                        >
                          <PlayCircleIcon className="w-4 h-4" />
                          Watch Recording
                        </button>
                        <a
                          href={recording.recording.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                          title="Download Recording"
                        >
                          ↓
                        </a>
                      </>
                    ) : (
                      <button className="btn btn-disabled btn-sm flex-1">
                        No Recording Available
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recording Player Modal */}
      {selectedRecording && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <h3 className="font-bold text-xl mb-4">{selectedRecording.problem}</h3>

            <div className="bg-base-200 rounded-lg overflow-hidden mb-4 aspect-video flex items-center justify-center">
              {selectedRecording.recording?.recordingUrl ? (
                <video
                  controls
                  className="w-full h-full"
                  src={selectedRecording.recording.recordingUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto opacity-50 mb-2" />
                  <p>Recording not available</p>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm opacity-60 mb-1">Host</p>
                <p className="font-semibold">{selectedRecording.host?.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm opacity-60 mb-1">Difficulty</p>
                  <span
                    className={`badge ${getDifficultyBadgeClass(
                      selectedRecording.difficulty
                    )}`}
                  >
                    {selectedRecording.difficulty}
                  </span>
                </div>
                <div>
                  <p className="text-sm opacity-60 mb-1">Participants</p>
                  <p className="font-semibold">
                    {(selectedRecording.participants?.length || 0) + 1}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-60 mb-1">Completed</p>
                  <p className="font-semibold">
                    {new Date(selectedRecording.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setSelectedRecording(null)}
                className="btn btn-ghost"
              >
                Close
              </button>
              {selectedRecording.recording?.recordingUrl && (
                <a
                  href={selectedRecording.recording.recordingUrl}
                  download
                  className="btn btn-primary"
                >
                  Download
                </a>
              )}
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setSelectedRecording(null)}
          ></div>
        </div>
      )}
    </div>
  );
}

export default SessionRecordings;
