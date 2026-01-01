import { Code2Icon, LoaderIcon, PlusIcon, XIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";
import { useGetUsers } from "../hooks/useSessions";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const problems = Object.values(PROBLEMS);
  const { data: usersData, isLoading: loadingUsers } = useGetUsers();
  const users = usersData?.users || [];

  if (!isOpen) return null;

  const handleUserToggle = (userId) => {
    setRoomConfig((prev) => {
      const participants = prev.participants || [];
      if (participants.includes(userId)) {
        return {
          ...prev,
          participants: participants.filter((id) => id !== userId),
        };
      } else {
        return {
          ...prev,
          participants: [...participants, userId],
        };
      }
    });
  };

  const selectedParticipants = roomConfig.participants || [];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

        <div className="space-y-8">
          {/* PROBLEM SELECTION */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Select Problem</span>
              <span className="label-text-alt text-error">*</span>
            </label>

            <select
              className="select w-full"
              value={roomConfig.problem}
              onChange={(e) => {
                const selectedProblem = problems.find((p) => p.title === e.target.value);
                setRoomConfig({
                  ...roomConfig,
                  difficulty: selectedProblem.difficulty,
                  problem: e.target.value,
                });
              }}
            >
              <option value="" disabled>
                Choose a coding problem...
              </option>

              {problems.map((problem) => (
                <option key={problem.id} value={problem.title}>
                  {problem.title} ({problem.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* PARTICIPANT SELECTION */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Select Participants</span>
              <span className="label-text-alt text-info text-xs">Optional</span>
            </label>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <LoaderIcon className="size-5 animate-spin" />
              </div>
            ) : users.length > 0 ? (
              <div className="border border-base-300 rounded-lg max-h-48 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 border-b border-base-300 last:border-b-0 hover:bg-base-200 cursor-pointer"
                    onClick={() => handleUserToggle(user._id)}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={selectedParticipants.includes(user._id)}
                      onChange={() => {}} // controlled by onClick
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs opacity-60">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-60 py-4">No other users available</p>
            )}

            {/* Selected Participants Display */}
            {selectedParticipants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedParticipants.map((userId) => {
                  const user = users.find((u) => u._id === userId);
                  return (
                    <div
                      key={userId}
                      className="badge badge-primary gap-2 px-3 py-2"
                    >
                      {user?.name}
                      <button
                        onClick={() => handleUserToggle(userId)}
                        className="btn btn-ghost btn-xs p-0 h-auto min-h-auto"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ROOM SUMMARY */}
          {roomConfig.problem && (
            <div className="alert alert-success">
              <Code2Icon className="size-5" />
              <div>
                <p className="font-semibold">Room Summary:</p>
                <p>
                  Problem: <span className="font-medium">{roomConfig.problem}</span>
                </p>
                <p>
                  Participants: <span className="font-medium">{selectedParticipants.length}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.problem}
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}

            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
export default CreateSessionModal;