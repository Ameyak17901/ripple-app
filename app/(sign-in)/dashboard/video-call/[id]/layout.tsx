"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Call,
  CallingState,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { createToken } from "@/actions/createToken";
import StatusCard from "@/components/StatusCard";
import { AlertTriangle, Video } from "lucide-react";
import { InlineLoadingSpinner } from "@/components/LoadingSpinner";
import "@stream-io/video-react-sdk/dist/css/styles.css"


if (!process.env.NEXT_PUBLIC_STREAM_API_KEY) {
  throw new Error("NEXT_PUBLIC_STREAM_API_KEY is not set");
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const { id } = useParams();
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  const streamUser = useMemo(() => {
    if (!user) return null;

    return {
      id: user?.id,
      name:
        user?.fullName || user.emailAddresses[0].emailAddress || "Unknown User",
      image: user?.imageUrl,
      type: "authenticated" as const,
    };
  }, [user]);
  const tokenProvider = useCallback(async () => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    return createToken(user?.id);
  }, [user?.id]);

  useEffect(() => {
    if (!streamUser) {
      setClient(null);
      return;
    }

    const newClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY as string,
      user: streamUser,
      tokenProvider,
    });

    setClient(newClient);

    return () => {
      newClient.disconnectUser().catch(console.error);
    };
  }, [streamUser, tokenProvider]);

  useEffect(() => {
    if (!client || !id) return;

    setError(null);
    const streamCall = client.call("default", id as string);

    const joinCall = async () => {
      try {
        await streamCall.join({ create: true });
        setCall(streamCall);
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : "Error joining the call"
        );
      }
    };
    joinCall();

    return () => {
      if (streamCall && streamCall.state.callingState === CallingState.JOINED) {
        streamCall.leave().catch(console.error);
      }
    };
  }, [client, id]);

  if (error) {
    return (
      <StatusCard
        title="Call Error"
        description={error}
        className="min-h-screen bg-red-50"
        action={
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus-ring-offset-2">
            Retry
          </button>
        }
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
      </StatusCard>
    );
  }

  if (!client) {
    return (
      <StatusCard
        title="Initializing Client..."
        description="Setting up video call connection..."
        className="min-h-screen bg-blue-50"
      >
        <InlineLoadingSpinner size="lg" />
      </StatusCard>
    )
  }
  if (!call) {
    return (
      <StatusCard
        title="Joining Call..."
        className="min-h-screen bg-green-50"
      >
        <div className="w-16 h-16 mx-auto animate-bounce">
          <div className="w-16 h-16 rounded-full bg-green-200 flex justify-center items-center">
            <Video className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="text-green-600 font-mono text-sm bg-green-100 px-3 py-1 rounded-full inline-block">
          Call Id: {id}
        </div>

      </StatusCard>
    )
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme className="text-white">
        <StreamCall call={call}>{children}</StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
};

export default Layout;
