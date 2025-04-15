"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDocTalkie, type Message } from "./use-doc-talkie";
import { cn } from "@/lib/utils";

// Define SVG Icons directly in the component
const IconMessageCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const IconX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const IconSend = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const IconLoader = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// --- Style Definitions ---

const BASE_FONT_SIZE = "14px";
const BORDER_RADIUS = "0.375rem"; // rounded-md
const BORDER_RADIUS_FULL = "9999px"; // rounded-full
const SHADOW_LG =
  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";

// Define Color Palettes (Replace Tailwind CSS variables)
const colors = {
  light: {
    background: "#ffffff", // bg-white
    border: "#e5e7eb", // border-neutral-200
    text: "#111827", // text-black
    textMuted: "#6b7280", // text-neutral-500
    placeholder: "#6b7280", // placeholder:text-neutral-500
    headerBg: "#f3f4f6", // bg-neutral-100
    userMsgBg: "#1f2937", // bg-neutral-900
    userMsgText: "#ffffff", // text-white
    assistantMsgBg: "#e5e7eb", // bg-neutral-200
    assistantMsgText: "#1f2937", // text-neutral-900
    inputBg: "#f3f4f6", // bg-neutral-100
    ring: "#111827", // focus-visible:ring-black
    buttonText: "#ffffff", // text-white
    buttonBg: "#1f2937", // bg-neutral-900
    buttonHoverBg: "#374151", // hover:bg-neutral-700
    closeIcon: "#4b5563", // text-neutral-600
    closeIconHover: "#111827", // hover:text-neutral-900
    toggleOpenBg: "#e5e7eb", // bg-neutral-200
    toggleOpenText: "#374151", // text-neutral-700
    toggleOpenHoverBg: "#d1d5db", // hover:bg-neutral-300
    loader: "#6b7280", // text-neutral-500
    codeBg: "#f3f4f6", // prose-pre:bg-neutral-100
  },
  dark: {
    background: "#0a0a0a", // bg-neutral-950
    border: "#262626", // border-neutral-800
    text: "#ffffff", // text-white
    textMuted: "#a3a3a3", // text-neutral-400
    placeholder: "#a3a3a3", // placeholder:text-neutral-400
    headerBg: "#171717", // bg-neutral-900
    userMsgBg: "#ffffff", // bg-white
    userMsgText: "#000000", // text-black
    assistantMsgBg: "#262626", // bg-secondary (assuming secondary is neutral-800)
    assistantMsgText: "#fafafa", // text-secondary-foreground (assuming this is neutral-50)
    inputBg: "#262626", // bg-neutral-800
    ring: "#ffffff", // focus-visible:ring-white
    buttonText: "#000000", // text-black
    buttonBg: "#ffffff", // bg-white
    buttonHoverBg: "#e5e7eb", // hover:bg-neutral-200
    closeIcon: "#a3a3a3", // text-neutral-400
    closeIconHover: "#ffffff", // hover:text-white
    toggleOpenBg: "#262626", // bg-secondary
    toggleOpenText: "#fafafa", // text-secondary-foreground
    toggleOpenHoverBg: "rgba(38, 38, 38, 0.8)", // hover:bg-secondary/80
    loader: "#a3a3a3", // text-neutral-400
    codeBg: "#262626", // dark:prose-pre:bg-neutral-800
  },
  // Define a 'doctalkie' theme - using detected primary and background colors
  doctalkie: {
    background: "hsl(222, 47%, 11%)", // ** USING DETECTED --background **
    border: "hsl(217, 32%, 17%)", // Use --muted for border
    text: "#ffffff", // White text on dark background
    textMuted: "#a3a3a3", // Keep light grey for muted text
    placeholder: "hsl(217, 32%, 35%)", // Slightly lighter muted for placeholder
    headerBg: "hsl(217, 32%, 17%)", // ** USING DETECTED --muted ** for header
    userMsgBg: "hsl(175, 100%, 45%)", // Using detected --primary (Cyan)
    userMsgText: "#ffffff", // White text on primary
    assistantMsgBg: "hsl(222, 47%, 13%)", // ** USING DETECTED --card ** for assistant messages
    assistantMsgText: "#fafafa", // Light text for assistant messages
    inputBg: "hsl(217, 32%, 17%)", // ** USING DETECTED --muted ** for input
    ring: "hsl(175, 100%, 45%)", // Using detected --primary (Cyan) for focus ring
    buttonText: "#ffffff", // White text on primary button
    buttonBg: "hsl(175, 100%, 45%)", // Using detected --primary (Cyan) for button
    buttonHoverBg: "hsl(175, 100%, 40%)", // Darker cyan on hover
    closeIcon: "#a3a3a3", // Light grey for close icon
    closeIconHover: "#ffffff", // White on hover
    toggleOpenBg: "hsl(222, 47%, 13%)", // ** USING DETECTED --card ** for open toggle button
    toggleOpenText: "#fafafa", // Light text for open toggle icon
    toggleOpenHoverBg: "hsl(222, 47%, 16%)", // Slightly darker card on hover
    loader: "#a3a3a3", // Light grey for loader
    codeBg: "hsl(222, 47%, 13%)", // ** USING DETECTED --card ** for code background
  },
};

// Interface for DocTalkieChat component props
interface DocTalkieChatProps {
  apiURL: string;
  apiKey: string;
  theme?: "dark" | "light" | "doctalkie";
  accentColor?: string;
  position?: "bottom-right" | "bottom-left";
  welcomeMessage?: string;
  className?: string; // Keep className for root container customization
}

export default function DocTalkieChat({
  apiURL,
  apiKey,
  theme = "dark",
  accentColor,
  position = "bottom-right",
  welcomeMessage = "Hi there! How can I help you today?",
  className, // Passed to the root div
}: DocTalkieChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, error, sendMessage } = useDocTalkie({
    apiURL,
    apiKey,
    initialMessages: [
      {
        id: "initial-welcome",
        content: welcomeMessage,
        sender: "assistant",
        timestamp: new Date(),
      },
    ],
  });

  const currentTheme = colors[theme] || colors.doctalkie; // Fallback to doctalkie

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false);
      setTimeout(() => setIsRendered(false), 300);
    } else {
      setIsRendered(true);
      setTimeout(() => setIsOpen(true), 10);
    }
  };

  const handleTriggerSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTriggerSend();
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  // --- Style Objects ---

  const rootStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 50,
    ...(position === "bottom-right"
      ? { bottom: "1.5rem", right: "1.5rem" }
      : { bottom: "1.5rem", left: "1.5rem" }),
  };

  const chatCardBaseStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "4rem", // bottom-16 equivalent if toggle button is h-12 + bottom-6 padding = 4rem
    width: "384px", // w-96
    height: "600px",
    boxShadow: SHADOW_LG,
    borderWidth: "1px",
    borderStyle: "solid",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transitionProperty: "all",
    transitionDuration: "300ms",
    transitionTimingFunction: "ease-out",
    ...(position === "bottom-right" ? { right: "0" } : { left: "0" }),
  };

  const chatCardThemeStyle: React.CSSProperties = {
    backgroundColor: currentTheme.background,
    borderColor: currentTheme.border,
    color: currentTheme.text,
  };

  const chatCardAnimationStyle: React.CSSProperties = isOpen
    ? { opacity: 1, transform: "scale(1) translateY(0)" }
    : { opacity: 0, transform: "scale(0.95) translateY(1rem)" }; // scale-95 translate-y-4

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem", // p-3
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    backgroundColor: currentTheme.headerBg,
    borderBottomColor: currentTheme.border,
  };

  const indicatorStyle: React.CSSProperties = {
    height: "0.5rem", // h-2
    width: "0.5rem", // w-2
    borderRadius: BORDER_RADIUS_FULL,
    marginRight: "0.5rem", // mr-2
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    backgroundColor: accentColor
      ? accentColor
      : theme === "dark"
      ? colors.dark.text // white
      : colors.light.userMsgBg, // primary equivalent for light/doctalkie
  };

  const headerTextStyle: React.CSSProperties = {
    fontWeight: 500, // font-medium
    color: currentTheme.text,
  };

  const closeButtonStyle: React.CSSProperties = {
    height: "2rem", // h-8
    width: "2rem", // w-8
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS,
    color: currentTheme.closeIcon,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    // Basic hover included, can be improved with state
    // ':hover': { color: currentTheme.closeIconHover } // Needs CSS-in-JS library or state handling
  };

  const messagesContainerStyle: React.CSSProperties = {
    flex: "1 1 0%",
    overflowY: "auto",
    padding: "0.75rem", // p-3
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem", // gap-3
  };

  const errorStyle: React.CSSProperties = {
    padding: "0.5rem", // p-2
    marginBottom: "0.5rem", // mb-2
    fontSize: "0.75rem", // text-xs
    textAlign: "center",
    color: "#b91c1c", // text-red-700
    backgroundColor: "#fee2e2", // bg-red-100
    borderRadius: BORDER_RADIUS,
    border: "1px solid #fecaca", // border-red-300
  };

  const getMessageStyle = (
    sender: "user" | "assistant"
  ): React.CSSProperties => {
    const isUser = sender === "user";
    const userBg = accentColor ? accentColor : currentTheme.userMsgBg;
    const userText = accentColor ? "#ffffff" : currentTheme.userMsgText; // Assume white text on accent color
    const assistantBg = currentTheme.assistantMsgBg;
    const assistantText = currentTheme.assistantMsgText;

    return {
      maxWidth: "80%",
      borderRadius: BORDER_RADIUS, // rounded-lg
      padding: "0.75rem", // p-3
      fontSize: BASE_FONT_SIZE, // text-sm
      position: "relative",
      overflowWrap: "break-word", // break-words equivalent
      alignSelf: isUser ? "flex-end" : "flex-start", // ml-auto equivalent
      backgroundColor: isUser ? userBg : assistantBg,
      color: isUser ? userText : assistantText,
      // Basic prose styles - might need refinement for specific elements like lists
      lineHeight: 1.5,
    };
  };

  const loaderContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    minHeight: "20px",
  };

  const loaderStyle: React.CSSProperties = {
    height: "1rem", // h-4
    width: "1rem", // w-4
    animation: "spin 1s linear infinite",
    color: currentTheme.loader,
  };

  const footerStyle: React.CSSProperties = {
    padding: "0.75rem", // p-3
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    backgroundColor: currentTheme.background,
    borderTopColor: currentTheme.border,
  };

  const inputAreaStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-end", // items-end
    gap: "0.5rem", // gap-2
  };

  const textareaBaseStyle: React.CSSProperties = {
    flex: "1 1 0%",
    border: "none", // border-0
    borderRadius: BORDER_RADIUS, // rounded-md
    resize: "none",
    padding: "0.5rem", // p-2
    fontSize: BASE_FONT_SIZE, // text-sm
    outline: "2px solid transparent",
    outlineOffset: "2px",
    // focus-visible:ring-1 needs JS focus handling or different approach
    // We'll use a simple blue outline on focus for now
    // ':focus-visible': { outline: `1px solid ${accentColor || currentTheme.ring}` } // Needs CSS-in-JS or state
  };

  const textareaThemeStyle: React.CSSProperties = {
    backgroundColor: currentTheme.inputBg,
    color: currentTheme.text,
    // placeholder styling needs ::placeholder pseudo-element, hard to do inline
  };

  const sendButtonStyle: React.CSSProperties = {
    height: "2.5rem", // h-10
    width: "2.5rem", // w-10
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS,
    border: "none",
    cursor: "pointer",
    backgroundColor: accentColor ? accentColor : currentTheme.buttonBg,
    color: accentColor ? "#ffffff" : currentTheme.buttonText,
    // Basic hover included
    // ':hover': { backgroundColor: accentColor ? accentColor : currentTheme.buttonHoverBg }, // Needs CSS-in-JS or state
    // ':disabled': { opacity: 0.7, cursor: 'not-allowed' } // Basic disabled style
  };

  const toggleButtonBaseStyle: React.CSSProperties = {
    height: "3rem", // h-12
    width: "3rem", // w-12
    borderRadius: BORDER_RADIUS_FULL,
    boxShadow: SHADOW_LG,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    // animation for pulse needs @keyframes, hard to do inline
  };

  const getToggleButtonThemeStyle = (): React.CSSProperties => {
    if (accentColor) {
      return { backgroundColor: accentColor, color: "#ffffff" };
    }
    if (theme === "light") {
      return isOpen
        ? {
            backgroundColor: colors.light.toggleOpenBg,
            color: colors.light.toggleOpenText,
          }
        : {
            backgroundColor: colors.light.buttonBg,
            color: colors.light.buttonText,
          };
    } else {
      // dark and doctalkie
      return isOpen
        ? {
            backgroundColor: currentTheme.toggleOpenBg, // secondary
            color: currentTheme.toggleOpenText, // secondary-foreground
          }
        : {
            backgroundColor: currentTheme.buttonBg, // primary or white
            color: currentTheme.buttonText, // primary-foreground or black
          };
    }
  };

  // --- Pre component for Markdown ---
  const PreComponent = ({
    node,
    ...props
  }: any): React.ReactElement<HTMLPreElement> => {
    // Combine potential props.className with our styles
    const preStyle: React.CSSProperties = {
      backgroundColor: currentTheme.codeBg,
      padding: "0.75rem", // p-3
      borderRadius: BORDER_RADIUS, // rounded-md
      overflowX: "auto",
      margin: "0.5rem 0", // my-2
    };
    // props might contain className, handle it if needed, or just apply styles
    return <pre style={preStyle} {...props} />;
  };

  // --- JSX ---
  return (
    // Add the passed className to the root div
    <div style={rootStyle} className={className}>
      {isRendered && (
        <div // Replaced Card with div
          style={{
            ...chatCardBaseStyle,
            ...chatCardThemeStyle,
            ...chatCardAnimationStyle,
          }}
        >
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={indicatorStyle}>
                {/* Pulse animation would require CSS @keyframes */}
              </div>
              <span style={headerTextStyle}>DocTalkie Assistant</span>
            </div>
            <button // Replaced Button with button
              style={closeButtonStyle}
              onClick={toggleChat}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = currentTheme.closeIconHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = currentTheme.closeIcon)
              }
            >
              <IconX style={{ height: "1rem", width: "1rem" }} />{" "}
              {/* h-4 w-4 */}
            </button>
          </div>

          {/* Messages Area */}
          <div style={messagesContainerStyle}>
            {error && <div style={errorStyle}>{error}</div>}
            {messages.map((message) => (
              <div key={message.id} style={getMessageStyle(message.sender)}>
                {message.isLoading ? (
                  <div style={loaderContainerStyle}>
                    <IconLoader style={loaderStyle} />
                  </div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{ pre: PreComponent }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <div style={inputAreaStyle}>
              <TextareaAutosize
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                style={{ ...textareaBaseStyle, ...textareaThemeStyle } as any}
                // Focus styles need more work for ring simulation
                onFocus={(e) =>
                  (e.target.style.outline = `1px solid ${
                    accentColor || currentTheme.ring
                  }`)
                }
                onBlur={(e) =>
                  (e.target.style.outline = "2px solid transparent")
                }
                minRows={1}
                maxRows={4}
                disabled={isLoading}
              />
              <button // Replaced Button with button
                style={{
                  ...sendButtonStyle,
                  ...(isLoading || !input.trim()
                    ? { opacity: 0.7, cursor: "not-allowed" }
                    : {}),
                }}
                onClick={handleTriggerSend}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <IconLoader
                    style={{
                      height: "1rem",
                      width: "1rem",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <IconSend style={{ height: "1rem", width: "1rem" }} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button // Replaced Button with button
        style={{ ...toggleButtonBaseStyle, ...getToggleButtonThemeStyle() }}
        onClick={toggleChat}
      >
        {isOpen ? (
          <IconX
            style={{ height: "1.25rem", width: "1.25rem" }}
          /> /* h-5 w-5 */
        ) : (
          <IconMessageCircle
            style={{ height: "1.25rem", width: "1.25rem" }}
          /> /* h-5 w-5 */
        )}
      </button>
    </div>
  );
}
