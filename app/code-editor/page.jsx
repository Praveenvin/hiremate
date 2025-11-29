"use client";

import { useState } from "react";
import { Box, Button, useToast, ChakraProvider } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import UserInput from "@/components/codeplatform/UserInput";
import { SuperVizRoomProvider } from "@superviz/react-sdk";
import theme from "@/utils/codeplatform/theme";

// Dynamic imports (no SSR)
const CodeEditor = dynamic(() => import("@/components/codeplatform/CodeEditor"), { ssr: false });
const VideoRoom = dynamic(() => import("@/components/codeplatform/VideoRoom"), { ssr: false });

// Safely load the API key
const DEVELOPER_API_KEY =
  process.env.NEXT_PUBLIC_SUPERVIZ_DEVELOPER_KEY ||
  process.env.NEXT_PUBLIC_SUPERVIZ_PRODUCTION_KEY ||
  "";

function CodeEditorPage() {
  const [userID, setUserID] = useState(null);
  const [roomID, setRoomID] = useState(null);
  const toast = useToast();

  const copyRoomID = () => {
    const roomURL = `${window.location.origin}/code-editor?roomId=${roomID}`;
    navigator.clipboard.writeText(roomURL);

    toast({
      title: "Room Link Copied",
      description: "The room link has been copied to your clipboard.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReportLink = () => {
    toast({
      title: "Report Link",
      description: "Report link not yet implemented.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={0}>
        {/* User Input */}
        {!userID && <UserInput setUserID={setUserID} setRoomID={setRoomID} />}

        {/* Editor + Video Room */}
        {userID && roomID && (
          <SuperVizRoomProvider
            developerKey={DEVELOPER_API_KEY}
            group={{ id: roomID, name: "Your Group Name" }}
            participant={{ id: userID, name: userID }}
            roomId={roomID}
          >
            <CodeEditor roomId={roomID} />
            <VideoRoom />
          </SuperVizRoomProvider>
        )}

        {/* Bottom Action Buttons */}
        {userID && roomID && (
          <Box paddingBottom={24} position="relative" borderRadius="full" p={4} boxShadow="lg">
            <Button
              sx={{
                color: "#ffffff",
                marginRight: "1.5rem",
                fontSize: "1rem",
                borderRadius: "6px",
                transition: "background-color 0.2s ease-in-out",
                _hover: {
                  bg: "rgba(248,248,255, 0.3)",
                },
              }}
              onClick={copyRoomID}
            >
              Copy Room ID
            </Button>

            <Button
              sx={{
                color: "#ffffff",
                fontSize: "1rem",
                borderRadius: "6px",
                transition: "background-color 0.2s ease-in-out",
                _hover: {
                  bg: "rgba(248,248,255, 0.3)",
                },
              }}
              onClick={handleReportLink}
            >
              Get Report Link
            </Button>
          </Box>
        )}
      </Box>
    </ChakraProvider>
  );
}

export default CodeEditorPage;
