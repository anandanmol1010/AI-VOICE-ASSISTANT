"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  interviewId?: string;
  feedbackId?: string;
  type: string;
  questions?: string[];
  profileImage?: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showMicWarningDialog, setShowMicWarningDialog] = useState(false);
  const [isInterviewStarting, setIsInterviewStarting] = useState(false);
  const userSpeakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);

        // When we get a final transcript from the user, they have stopped speaking
        if (message.role === "user") {
          setIsUserSpeaking(false);
        }
      } else if (
        message.type === "transcript" &&
        message.transcriptType === "partial"
      ) {
        // When we get a partial transcript from the user, they are speaking
        if (message.role === "user") {
          setIsUserSpeaking(true);

          // Clear any existing timeout
          if (userSpeakingTimeoutRef.current) {
            clearTimeout(userSpeakingTimeoutRef.current);
          }

          // Set a timeout to detect when the user stops speaking
          userSpeakingTimeoutRef.current = setTimeout(() => {
            setIsUserSpeaking(false);
          }, 1500); // 1.5 seconds of silence means the user has stopped speaking
        }
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
      setIsUserTurn(false); // Not user's turn when AI is speaking
      setIsUserSpeaking(false); // User is not speaking when AI is speaking
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
      setIsUserTurn(true); // User's turn after AI stops speaking
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  useEffect(() => {
    return () => {
      // Clean up camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Only try to activate camera when call becomes active and permission is granted
    if (
      callStatus === CallStatus.ACTIVE &&
      cameraPermission === true &&
      !cameraActive
    ) {
      // Add a small delay before activating camera to ensure DOM is ready
      setTimeout(() => {
        activateCamera();
      }, 500);
    }

    // Deactivate camera when call ends
    if (callStatus === CallStatus.FINISHED && cameraActive) {
      deactivateCamera();
    }
  }, [callStatus, cameraPermission, cameraActive]);

  const handleCall = async () => {
    // Check if permissions are granted before starting
    if (micPermission !== true) {
      // If we already know microphone permission is denied, show the warning dialog
      if (micPermission === false) {
        setShowMicWarningDialog(true);
        return;
      }

      // If we don't know the permission status yet, check it
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        micStream.getTracks().forEach((track) => track.stop());
        setMicPermission(true);
        // Continue with the interview now that we have permission
      } catch (error) {
        // Microphone permission denied
        setMicPermission(false);
        setShowMicWarningDialog(true);
        return;
      }
    }

    // Set interview as starting to prevent multiple starts
    if (isInterviewStarting) return;
    setIsInterviewStarting(true);
    setCallStatus(CallStatus.CONNECTING);

    // Activate camera if permission is granted
    if (cameraPermission === true) {
      try {
        await activateCamera();
      } catch (error) {
        console.error("Error activating camera:", error);
        // Continue without camera if there's an error
      }
    }

    try {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      setCallStatus(CallStatus.INACTIVE);
      setIsInterviewStarting(false);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();

    // Stop the camera when the interview ends
    if (cameraActive) {
      deactivateCamera();
    }
  };

  const requestPermissions = async (requestCamera = true) => {
    try {
      // Request microphone permission first (mandatory)
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        // Stop the stream immediately after getting permission
        micStream.getTracks().forEach((track) => track.stop());
        setMicPermission(true);
        console.log("Microphone permission granted");
      } catch (micError) {
        console.error("Microphone permission denied:", micError);
        setMicPermission(false);
        // Show warning dialog for microphone - this is mandatory
        setShowMicWarningDialog(true);
        return { camera: false, microphone: false };
      }

      // Only request camera permission if the user wants it
      if (requestCamera) {
        try {
          const randomId = Date.now().toString();
          const constraints = {
            video: {
              width: { ideal: 360 },
              height: { ideal: 360 },
              facingMode: "user",
              deviceId: { ideal: randomId },
            },
          };

          const cameraStream = await navigator.mediaDevices.getUserMedia(
            constraints
          );
          // Stop the stream immediately after getting permission
          cameraStream.getTracks().forEach((track) => track.stop());
          setCameraPermission(true);
          console.log("Camera permission granted");
          return { camera: true, microphone: true };
        } catch (cameraError) {
          console.error("Camera permission denied:", cameraError);
          setCameraPermission(false);
          // Camera is optional, so we can continue with just microphone
          return { camera: false, microphone: true };
        }
      } else {
        // User chose not to use camera, so we don't request permission
        setCameraPermission(false);
        return { camera: false, microphone: true };
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setCameraPermission(false);
      setMicPermission(false);
      return { camera: false, microphone: false };
    }
  };

  const activateCamera = async () => {
    try {
      if (!videoRef.current) {
        console.error("Video ref is not available");
        return;
      }

      console.log("Activating camera...");

      // First ensure any previous streams are stopped
      if (videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject as MediaStream;
        oldStream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }

      const constraints = {
        video: {
          width: { ideal: 360 },
          height: { ideal: 360 },
          facingMode: "user",
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera stream obtained:", stream);

      // Set the stream as the video source
      videoRef.current.srcObject = stream;

      // Force the video element to be visible
      if (videoRef.current.style.display === "none") {
        videoRef.current.style.display = "block";
      }

      // Try to play the video immediately
      try {
        await videoRef.current.play();
        console.log("Video playing successfully");
        setCameraActive(true);
      } catch (playError) {
        console.error("Error playing video immediately:", playError);

        // If immediate play fails, try again after metadata is loaded
        videoRef.current.onloadedmetadata = async () => {
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              console.log("Video playing after metadata loaded");
              setCameraActive(true);
            } catch (err) {
              console.error("Error playing video after metadata:", err);
            }
          }
        };
      }
    } catch (error) {
      console.error("Error activating camera:", error);
      setCameraPermission(false);
    }
  };

  const deactivateCamera = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const tracks = stream.getTracks();

    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const handlePermissionDialogResponse = async (allowCamera: boolean) => {
    // Close the dialog first
    setShowPermissionDialog(false);

    // Request permissions immediately
    try {
      // Request microphone permission (mandatory)
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        micStream.getTracks().forEach((track) => track.stop());
        setMicPermission(true);

        // If user wants camera, request it now
        if (allowCamera) {
          try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            videoStream.getTracks().forEach((track) => track.stop());
            setCameraPermission(true);
          } catch (cameraError) {
            console.error("Camera permission denied:", cameraError);
            setCameraPermission(false);
          }
        } else {
          // User chose not to use camera
          setCameraPermission(false);
        }

        // Start the interview directly
        handleCall();
      } catch (micError) {
        console.error("Microphone permission denied:", micError);
        setMicPermission(false);
        setShowMicWarningDialog(true);
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
    }
  };

  const handleMicWarningResponse = () => {
    // Close the warning dialog
    setShowMicWarningDialog(false);

    // Reset the interview starting state
    setIsInterviewStarting(false);

    // Try to open browser settings
    try {
      // Try different approaches for different browsers
      if (navigator.userAgent.indexOf("Chrome") !== -1) {
        window.open("chrome://settings/content/microphone", "_blank");
      } else if (navigator.userAgent.indexOf("Firefox") !== -1) {
        window.open("about:preferences#privacy", "_blank");
      } else if (navigator.userAgent.indexOf("Safari") !== -1) {
        alert(
          "Please open Safari Preferences > Websites > Microphone to enable access."
        );
      } else {
        alert(
          "Please enable microphone access in your browser settings and refresh the page."
        );
      }
    } catch (error) {
      console.error("Could not open browser settings", error);
      alert(
        "Please enable microphone access in your browser settings and refresh the page."
      );
    }
  };

  return (
    <div className="bg-dark-200/50 rounded-xl border border-light-800/10 p-6 pt-6 pb-3 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* AI Interviewer Card */}
        <div className="bg-gradient-to-br from-dark-200 to-dark-300 rounded-xl p-10 flex flex-col items-center shadow-lg border border-primary-100/10 transition-all duration-300 hover:border-primary-100/20">
          <div className="relative mb-6">
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br from-primary-100/20 to-primary-200/20 rounded-full blur-md transition-all duration-500",
                isSpeaking
                  ? "opacity-100 scale-110 animate-pulse-slow"
                  : "opacity-30 scale-100"
              )}
            ></div>
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={180}
              height={180}
              className="rounded-full object-cover size-[180px] relative z-10"
            />
            {isSpeaking && (
              <div className="absolute bottom-0 right-0 size-8 bg-success-100 rounded-full z-20 flex items-center justify-center border-2 border-dark-200">
                <div className="size-4 bg-success-100 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <h3 className="text-2xl font-semibold text-light-100 mb-2">
            AI Interviewer
          </h3>
          <p className="text-light-100/70 text-center text-base max-w-xs">
            Professional interview coach with expertise in technical and
            behavioral questions
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-dark-200 to-dark-300 rounded-xl p-10 flex flex-col items-center shadow-lg border border-primary-100/10 transition-all duration-300 hover:border-primary-100/20">
          <div className="relative mb-6">
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br from-primary-100/10 to-primary-200/10 rounded-full blur-md transition-all duration-500",
                isUserSpeaking
                  ? "opacity-100 scale-110 animate-pulse-slow"
                  : "opacity-30 scale-100"
              )}
            ></div>

            {/* Show static image when camera is not active */}
            {!cameraActive && (
              <Image
                src="/user-avatar.png"
                alt="User Avatar"
                width={180}
                height={180}
                className="rounded-full object-cover size-[180px] relative z-10"
              />
            )}

            {/* Show video feed when camera is active */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "rounded-full object-cover size-[180px] relative z-10",
                cameraActive ? "block" : "hidden"
              )}
              style={{
                transform: "scaleX(-1)",
                width: "180px",
                height: "180px",
              }} // Mirror the video for selfie view
            />

            {!isSpeaking && callStatus === CallStatus.ACTIVE && (
              <div className="absolute bottom-0 right-0 size-8 bg-success-100 rounded-full z-20 flex items-center justify-center border-2 border-dark-200">
                <div
                  className={cn(
                    "size-4 bg-success-100 rounded-full",
                    isUserSpeaking ? "animate-pulse" : ""
                  )}
                ></div>
              </div>
            )}
          </div>
          <h3 className="text-2xl font-semibold text-light-100 mb-2">
            {userName}
          </h3>
          <p className="text-light-100/70 text-center text-base max-w-xs">
            Candidate
          </p>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="w-full bg-dark-200/50 rounded-xl p-5 border border-primary-100/10 shadow-md mt-4">
          <h4 className="text-base font-medium text-primary-100/80 mb-2">
            Last message:
          </h4>
          <p
            key={lastMessage}
            className={cn(
              "text-light-100/90 text-lg transition-opacity duration-500 opacity-0",
              "animate-fadeIn opacity-100"
            )}
          >
            {lastMessage}
          </p>
        </div>
      )}

      <div className="w-full flex justify-center mt-5 mb-2">
        {callStatus === CallStatus.INACTIVE && (
          <button
            className="btn-call flex items-center gap-2 px-7 py-2.5 text-base"
            onClick={() => setShowPermissionDialog(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Start Interview
          </button>
        )}

        {callStatus === CallStatus.CONNECTING && (
          <button className="btn-call opacity-70 cursor-not-allowed flex items-center gap-2 px-7 py-2.5 text-base">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Connecting...
          </button>
        )}

        {callStatus === CallStatus.ACTIVE && (
          <button
            className="btn-disconnect flex items-center gap-2 px-7 py-2.5 text-base"
            onClick={() => handleDisconnect()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              <line x1="23" y1="1" x2="1" y2="23"></line>
            </svg>
            End Interview
          </button>
        )}
      </div>

      {callStatus === CallStatus.ACTIVE && (
        <div className="w-full bg-dark-200/30 rounded-xl p-4 flex justify-center border border-primary-100/5">
          <p className="text-base text-light-100/60 flex items-center gap-2">
            <span className="size-2 bg-success-100 rounded-full animate-pulse"></span>
            Interview in progress - Speak clearly into your microphone
          </p>
        </div>
      )}

      {/* Permissions Dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-xl p-6 max-w-md w-full border border-primary-100/20 shadow-lg">
            <h3 className="text-xl font-semibold text-light-100 mb-4">
              Permissions Required
            </h3>
            <div className="text-light-100/80 mb-6">
              <p className="mb-4">
                This interview requires microphone access and optionally camera
                access.
              </p>
              <div className="bg-dark-300 p-3 rounded-lg mb-4">
                <p className="text-primary-100 font-medium mb-2">
                  Microphone (Required):
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Needed to hear your responses during the interview</li>
                  <li>Required for the AI to understand and respond to you</li>
                  <li>
                    Without microphone access, the interview cannot proceed
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-primary-100 font-medium mb-2">
                  Camera (Optional):
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Creates a more realistic interview experience</li>
                  <li>
                    Helps practice maintaining eye contact and body language
                  </li>
                  <li>Simulates a real video interview environment</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => handlePermissionDialogResponse(false)}
                className="px-4 py-2 bg-dark-300 text-light-100 rounded-lg hover:bg-dark-300/80 transition-colors"
              >
                Continue Without Camera
              </button>
              <button
                onClick={() => handlePermissionDialogResponse(true)}
                className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-300 transition-colors"
              >
                Enable Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Microphone Warning Dialog */}
      {showMicWarningDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-xl p-6 max-w-md w-full border border-red-500/50 shadow-lg">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-light-100">
                Microphone Access Required
              </h3>
            </div>
            <div className="text-light-100/80 mb-6">
              <p className="mb-4 text-red-200">
                Microphone access was denied. This interview requires microphone
                access to proceed.
              </p>
              <p className="mb-2">To enable your microphone:</p>
              <ol className="list-decimal pl-5 space-y-1 mb-4">
                <li>
                  Click the <strong>"&#x24D8;"</strong> icon in your browser's
                  address bar
                </li>
                <li>
                  In the popup dialog box, find the microphone permission which
                  is currently <strong>"Off"</strong>
                </li>
                <li>
                  Turn it <strong>"On"</strong> or click{" "}
                  <strong>"Reset Permission"</strong> directly from this popup
                </li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary-100 text-dark-100 rounded-lg hover:bg-primary-200 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agent;
