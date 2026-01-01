import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      if (!session?.callId) return;
      if (!isHost && !isParticipant) return;
      if (session.status === "completed") return;

      try {
        // Get both video token and chat token
        const videoTokenResponse = await sessionApi.getStreamToken();
        const { token: chatToken, userId, userName, userImage } = videoTokenResponse;

        // Initialize video client with proper token
        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          chatToken
        );

        setStreamClient(client);

        videoCall = client.call("default", session.callId);
        
        // Join with create option to ensure call is created if it doesn't exist
        console.log("🎥 Joining video call:", session.callId);
        await videoCall.join({ create: true });
        setCall(videoCall);
        console.log("✅ Successfully joined video call");

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        console.log("💬 Connecting to chat...");
        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          chatToken
        );
        setChatClient(chatClientInstance);
        console.log("✅ Chat connected successfully");

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);
        console.log("✅ Chat channel watched successfully");
      } catch (error) {
        toast.error("Failed to join video call");
        console.error("❌ Error initializing call:", error);
        console.error("Error details:", {
          message: error?.message,
          code: error?.code,
          statusCode: error?.statusCode,
        });
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) initCall();

    // cleanup - performance reasons
    return () => {
      // iife
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;