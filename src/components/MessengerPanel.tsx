import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, Box, Divider, Drawer, IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import ExternalLinkIcon from "@diligentcorp/atlas-react-bundle/icons/ExternalLink";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import MessagesIcon from "@diligentcorp/atlas-react-bundle/icons/Messages";
import ArrowLeftIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowLeft";
import FormatBold from "@diligentcorp/atlas-react-bundle/icons/FormatBold";
import FormatItalic from "@diligentcorp/atlas-react-bundle/icons/FormatItalic";
import FormatUnderlined from "@diligentcorp/atlas-react-bundle/icons/FormatUnderlined";
import FormatStrikethrough from "@diligentcorp/atlas-react-bundle/icons/FormatStrikethrough";
import ListIcon from "@diligentcorp/atlas-react-bundle/icons/List";
import ListNumbered from "@diligentcorp/atlas-react-bundle/icons/ListNumbered";
import FormatAlignLeft from "@diligentcorp/atlas-react-bundle/icons/FormatAlignLeft";
import Attach from "@diligentcorp/atlas-react-bundle/icons/Attach";
import LinkIcon from "@diligentcorp/atlas-react-bundle/icons/Link";
import AtSign from "@diligentcorp/atlas-react-bundle/icons/AtSign";
import Send from "@diligentcorp/atlas-react-bundle/icons/Send";
import Reply from "@diligentcorp/atlas-react-bundle/icons/Reply";
import FileIcon from "@diligentcorp/atlas-react-bundle/icons/File";
import Download from "@diligentcorp/atlas-react-bundle/icons/Download";
import { useMessenger } from "../context/MessengerContext.js";
import GroupComposer from "./GroupComposer.js";
import { type ExistingGroup, type Person, EXISTING_GROUPS } from "../data/people.js";

const DRAWER_WIDTH = 440;

type AvatarColor = "blue" | "yellow" | "green" | "red" | "purple";

interface Conversation {
  id: string;
  name: string;
  initials: string;
  avatarColor: AvatarColor;
  time: string;
  preview: string;
  unread?: number;
  isGroup?: boolean;
  groupCount?: number;
}

interface Message {
  id: string;
  sender: string;
  initials: string;
  avatarColor: AvatarColor;
  time: string;
  text: string;
  attachment?: { name: string; size: string };
}

function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

const initialConversations: Conversation[] = [
  { id: "1", name: "Sarah Johnson", initials: "SJ", avatarColor: "blue", time: "10:28", preview: "Board appreciates your insight and steady leadership during the quarterly review meeting.", unread: 3 },
  { id: "2", name: "Michael Kim", initials: "MK", avatarColor: "green", time: "10:30", preview: "Your dedication to the project has not gone unnoticed. Excellent work on the deliverables this sprint." },
  { id: "3", name: "Rachel Brown", initials: "RB", avatarColor: "purple", time: "10:32", preview: "Great job on the presentation! Your creativity shines through every slide you produced.", unread: 2 },
  { id: "4", name: "Lucas Davis", initials: "LD", avatarColor: "green", time: "10:34", preview: "Thank you for your analytical approach. It has significantly improved our decision-making process." },
  { id: "5", name: "Alice Nguyen", initials: "AN", avatarColor: "blue", time: "10:36", preview: "Your teamwork and collaboration are exemplary and inspire everyone around you to do better." },
  { id: "6", name: "Brian Thompson", initials: "BT", avatarColor: "red", time: "12:30", preview: "Appreciate your ability to tackle challenges head-on. Keep it up and let me know if you need support." },
  { id: "7", name: "Finance team", initials: "JS", avatarColor: "green", time: "23.05.", preview: "Your insights have opened new avenues for our market expansion strategy going forward.", unread: 2, isGroup: true, groupCount: 24 },
  { id: "8", name: "Ethan Adams", initials: "EA", avatarColor: "yellow", time: "04.06", preview: "You have an incredible knack for problem-solving. Great job!" },
  { id: "9", name: "Grace Fisher", initials: "GF", avatarColor: "green", time: "09.12.", preview: "Thank you for your commitment to quality. It elevates our work and sets a standard for the team." },
  { id: "10", name: "Henry Roberts", initials: "HR", avatarColor: "purple", time: "03.12.", preview: "Your leadership during the crisis has been inspiring. Thank you for keeping everyone focused." },
];

function getThreadMessages(conversation: Conversation): Message[] {
  const other = { sender: conversation.name, initials: conversation.initials, avatarColor: conversation.avatarColor };
  const me = { sender: "John Doe", initials: "JD", avatarColor: "blue" as AvatarColor };
  return [
    { id: "m1", ...me, time: "10:02 AM", text: "That would help a lot. Also, did we confirm whether Martin is joining in person or remotely?" },
    { id: "m2", ...other, time: "10:05 AM", text: "He'll be joining remotely. His assistant said he has a conflicting appointment across town, so I've asked IT to test his video link in advance and keep someone on standby in case he has connection issues during the meeting." },
    { id: "m3", ...me, time: "10:07 AM", text: "Good thinking. I'd rather avoid technical delays in front of the board." },
    { id: "m4", ...other, time: "10:05 AM", text: "Completely agree. I've learned that even a small issue at the start can throw off the tone of the whole meeting, so I'm trying to remove as much friction as possible before everyone arrives." },
    { id: "m5", ...me, time: "10:10 AM", text: "I appreciate that. One more thing, can you shift my prep session with Operations by 30 minutes if needed?" },
    { id: "m6", ...other, time: "10:15 AM", text: "Yes, I can handle that. I'll first check whether the team is flexible, and if they are, I'll move it to give you a bit more breathing room before the board session starts." },
    { id: "m7", ...me, time: "10:17 AM", text: "Thanks!" },
    { id: "m8", ...other, time: "10:30 AM", text: "Just received this from Andrew, please take a look at it when you have the time.", attachment: { name: "Finances_Q3", size: "24 MB" } },
  ];
}

function ConversationItem({ conversation, onSelect }: { conversation: Conversation; onSelect: (id: string) => void }) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();
  const avatarProps = AvatarPresets.getAvatarProps({ size: "large", color: conversation.avatarColor });
  const yellowOverride = conversation.avatarColor === "yellow" ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" } : {};

  return (
    <Box
      onClick={() => onSelect(conversation.id)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        px: "16px",
        py: "16px",
        cursor: "pointer",
        "&:hover": { backgroundColor: color.surface.variant.value },
      }}
    >
      {conversation.isGroup ? (
        <Box sx={{ width: 40, height: 40, position: "relative", flexShrink: 0 }}>
          <Avatar {...AvatarPresets.getAvatarProps({ size: "small", color: "green" })} sx={{ ...AvatarPresets.getAvatarProps({ size: "small", color: "green" }).sx, position: "absolute", top: 0, right: 0, width: 24, height: 24, fontSize: "9px" }}>
            +{conversation.groupCount}
          </Avatar>
          <Avatar {...AvatarPresets.getAvatarProps({ size: "small", color: "blue" })} sx={{ ...AvatarPresets.getAvatarProps({ size: "small", color: "blue" }).sx, position: "absolute", bottom: 0, left: 0, width: 24, height: 24, fontSize: "9px" }}>
            {conversation.initials}
          </Avatar>
        </Box>
      ) : (
        <Avatar {...avatarProps} sx={{ ...avatarProps.sx, ...yellowOverride }}>{conversation.initials}</Avatar>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap="8px">
          <Typography
            sx={{
              color: "var(--Semantic-Color-Type-Default, #242628)",
              fontFamily: "var(--Semantic-Typography-Text-Md-Font, Inter)",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: conversation.unread ? 600 : 400,
              lineHeight: "20px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {conversation.name}
          </Typography>
          <Typography
            sx={{
              color: "var(--Semantic-Color-Type-Default, #242628)",
              fontFamily: "var(--Semantic-Typography-Text-Md-Font, Inter)",
              fontSize: "12px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "18px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {conversation.time}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap="8px" sx={{ mt: "2px" }}>
          <Typography
            sx={{
              overflow: "hidden",
              color: "var(--Semantic-Color-Type-Default, #242628)",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "var(--Semantic-Typography-Text-Body-Font, Inter)",
              fontSize: "12px",
              fontStyle: "normal",
              fontWeight: conversation.unread ? 600 : 400,
              lineHeight: "18px",
            }}
          >
            {conversation.preview}
          </Typography>
          {conversation.unread && (
            <Box
              sx={{
                minWidth: 18,
                height: 18,
                borderRadius: "9px",
                backgroundColor: "var(--Semantic-Color-Status-New-Default, #1C4EE4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: "4px",
                flexShrink: 0,
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: "11px", fontWeight: 600, lineHeight: 1 }}>
                {conversation.unread}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

const REACTIONS = [
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "👎", label: "Thumbs down" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😡", label: "Angry" },
];

function MessageItem({ message }: { message: Message }) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();
  const avatarProps = AvatarPresets.getAvatarProps({ size: "medium", color: message.avatarColor });
  const yellowOverride = message.avatarColor === "yellow" ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" } : {};
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        width: "100%",
        position: "relative",
        borderRadius: "8px",
        px: "8px",
        py: "8px",
        backgroundColor: hovered ? color.action.secondary.hoverFill.value : "transparent",
        transition: "background-color 150ms ease",
      }}
    >
      <Avatar {...avatarProps} sx={{ ...avatarProps.sx, ...yellowOverride }}>
        {message.initials}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        <Stack direction="row" alignItems="center" gap="8px">
          <Typography sx={{
            fontFamily: "var(--Semantic-Typography-Text-Md-Font, Inter)",
            fontSize: "12px",
            fontWeight: 600,
            lineHeight: "var(--Semantic-Typography-Text-Sm-Line-height, 12px)",
            letterSpacing: "var(--Semantic-Typography-Text-Md-Letter-spacing, 0.3px)",
            color: "var(--Semantic-Color-Type-Default, #242628)",
          }}>
            {message.sender}
          </Typography>
          <Typography sx={{
            fontFamily: "var(--Semantic-Typography-Text-Md-Font, Inter)",
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "var(--Semantic-Typography-Text-Sm-Line-height, 12px)",
            letterSpacing: "var(--Semantic-Typography-Text-Md-Letter-spacing, 0.3px)",
            color: "var(--Semantic-Color-Type-Muted, #6f7377)",
          }}>
            {message.time}
          </Typography>
        </Stack>
        <Typography sx={{
          fontFamily: "var(--Semantic-Typography-Text-Body-Font, Inter)",
          fontSize: "var(--Semantic-Typography-Text-Body-Size, 14px)",
          fontWeight: 400,
          lineHeight: "var(--Semantic-Typography-Text-Body-Line-height, 20px)",
          letterSpacing: "var(--Semantic-Typography-Text-Body-Letter-spacing, 0.2px)",
          color: "var(--Semantic-Color-Type-Default, #242628)",
        }}>
          {message.text}
        </Typography>
        {message.attachment && (
          <Box
            sx={{
              mt: "4px",
              border: `1px solid ${color.outline.fixed.value}`,
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: color.surface.default.value,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", px: "12px", py: "12px" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileIcon size="md" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontFamily: "var(--Semantic-Typography-Text-Body-Font, Inter)",
                  fontSize: "var(--Semantic-Typography-Text-Body-Size, 14px)",
                  fontWeight: 600,
                  lineHeight: "var(--Semantic-Typography-Text-Body-Line-height, 20px)",
                  color: "var(--Semantic-Color-Type-Default, #242628)",
                }}>
                  {message.attachment.name}
                </Typography>
                <Typography sx={{
                  fontFamily: "var(--Semantic-Typography-Text-Body-Font, Inter)",
                  fontSize: "var(--Semantic-Typography-Text-Body-Size, 14px)",
                  fontWeight: 400,
                  lineHeight: "var(--Semantic-Typography-Text-Body-Line-height, 20px)",
                  color: "var(--Semantic-Color-Type-Default, #242628)",
                }}>
                  {message.attachment.size}
                </Typography>
              </Box>
              <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}>
                <Download size="md" />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* Hover actions toolbar */}
      {hovered && (
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            position: "absolute",
            top: "-16px",
            right: "4px",
            zIndex: 2,
            backgroundColor: color.surface.default.value,
            border: `1px solid ${color.outline.fixed.value}`,
            borderRadius: "20px",
            boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.08)",
            px: "4px",
            py: "2px",
            gap: "2px",
          }}
        >
          {REACTIONS.map((reaction) => (
            <Tooltip key={reaction.label} title={reaction.label} arrow>
              <Box
                component="button"
                sx={{
                  all: "unset",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  fontSize: "16px",
                  "&:hover": { backgroundColor: color.surface.variant.value },
                }}
              >
                {reaction.emoji}
              </Box>
            </Tooltip>
          ))}
          <Tooltip title="Reply" arrow>
            <IconButton
              size="small"
              sx={{
                width: 28,
                height: 28,
                color: color.type.default.value,
                "&:hover": { backgroundColor: color.surface.variant.value },
              }}
            >
              <Reply size="sm" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Box>
  );
}

interface ThreadViewProps {
  conversation: Conversation | null;
  messages: Message[];
  onBack: () => void;
  hideSubheader?: boolean;
  composerSlot?: React.ReactNode;
  onBackgroundClick?: () => void;
  onComposerBarClick?: () => void;
  inputValue?: string;
  onInputChange?: (v: string) => void;
  onSend?: () => void;
}

function ThreadView({ conversation, messages, onBack, hideSubheader, composerSlot, onBackgroundClick, onComposerBarClick, inputValue, onInputChange, onSend }: ThreadViewProps) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();
  const avatarColor = conversation?.avatarColor ?? "blue";
  const avatarProps = AvatarPresets.getAvatarProps({ size: "small", color: avatarColor });
  const yellowOverride = avatarColor === "yellow" ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" } : {};
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [conversation?.id]);

  const todayIndex = 4;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {composerSlot}
      {/* Thread content area — gradient behind subheader so rounded corners are visible */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "var(--Gradient-background-default, radial-gradient(125.08% 101.36% at 0% 0%, var(--Semantic-Color-Background-Base-gradient-start, #F9F9FC) 30.53%, var(--Semantic-Color-Background-Base-gradient-end, #FCFCFF) 100%))",
        }}
        onClick={onBackgroundClick}
      >
        {/* Thread subheader */}
        {!hideSubheader && conversation && (
          <Stack
            direction="row"
            alignItems="center"
            gap="8px"
            sx={{
              flexShrink: 0,
              px: "12px",
              py: "12px",
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
              boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.06)",
              backgroundColor: "#fff",
              position: "relative",
              zIndex: 1,
            }}
          >
            <IconButton sx={{ p: "4px", width: 32, height: 32 }} onClick={onBack} title="Back">
              <ArrowLeftIcon size="lg" />
            </IconButton>
            <Avatar {...avatarProps} sx={{ ...avatarProps.sx, ...yellowOverride, width: 32, height: 32, fontSize: "12px" }}>
              {conversation.initials}
            </Avatar>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                color: color.type.default.value,
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {conversation.name}
            </Typography>
            <IconButton sx={{ p: "4px", width: 32, height: 32 }} title="More options">
              <MoreIcon size="lg" />
            </IconButton>
          </Stack>
        )}

        {/* Messages area */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: "12px",
            position: "relative",
          }}
        >
        {/* Inner shadow overlay */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            height: 0,
            zIndex: 1,
            pointerEvents: "none",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-12px",
              right: "-12px",
              height: "11px",
              boxShadow: "inset 0px 11px 6px -6px rgba(0,0,0,0.08)",
            },
          }}
        />
        {isEmpty ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              px: "40px",
              pb: "80px",
              cursor: onBackgroundClick ? "pointer" : "default",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: "16px", color: color.type.muted.value }}>
              <MessagesIcon size="xl" />
            </Box>
            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: color.type.default.value, mb: "4px" }}>
              You are starting a new group chat
            </Typography>
            <Typography sx={{ fontSize: "14px", color: color.type.muted.value }}>
              Type your first message below
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pb: "8px" }}>
            {messages.map((msg, index) => (
              <Box key={msg.id}>
                {index === todayIndex && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "4px", py: "8px", mb: "16px" }}>
                    <Divider sx={{ flex: 1 }} />
                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: color.type.muted.value, px: "4px" }}>
                      Today
                    </Typography>
                    <Divider sx={{ flex: 1 }} />
                  </Box>
                )}
                <MessageItem message={msg} />
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
        </Box>
      </Box>

      {/* Input area */}
      <Box
        onClick={onComposerBarClick}
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${color.ui.divider.default.value}`,
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          backgroundColor: color.surface.default.value,
          overflow: "hidden",
          cursor: onComposerBarClick ? "pointer" : "default",
        }}
      >
        {/* Formatting toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            px: "8px",
            py: "4px",
            borderBottom: `1px solid ${color.ui.divider.default.value}`,
            backgroundColor: color.background.base.value,
          }}
        >
          <Stack direction="row" gap={0}>
            <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><FormatBold size="md" /></IconButton>
            <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><FormatItalic size="md" /></IconButton>
            <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><FormatUnderlined size="md" /></IconButton>
            <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><FormatStrikethrough size="md" /></IconButton>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" gap={0}>
            <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><ListIcon size="md" /></IconButton>
            <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><ListNumbered size="md" /></IconButton>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><FormatAlignLeft size="md" /></IconButton>
        </Box>

        {/* Text input */}
        <Box sx={{ px: "12px", pb: "12px" }} onClick={(e) => e.stopPropagation()}>
          <Box sx={{ pt: "12px", pb: "40px" }}>
            {onInputChange ? (
              <Box
                component="textarea"
                value={inputValue ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputChange(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend?.();
                  }
                }}
                placeholder="Type something..."
                rows={1}
                sx={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  background: "transparent",
                  fontFamily: "inherit",
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: color.type.default.value,
                  p: 0,
                  "&::placeholder": { color: color.type.muted.value, opacity: 1 },
                }}
              />
            ) : (
              <Typography sx={{ fontSize: "16px", color: color.type.muted.value }}>
                Type something...
              </Typography>
            )}
          </Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" gap={0}>
              <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><Attach size="md" /></IconButton>
              <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><LinkIcon size="md" /></IconButton>
              <IconButton size="small" sx={{ width: 40, height: 40, color: color.type.default.value }}><AtSign size="md" /></IconButton>
            </Stack>
            <IconButton
              size="small"
              onClick={onSend}
              disabled={!onSend || !(inputValue ?? "").trim()}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                border: `1px solid ${color.outline.fixed.value}`,
                color: color.type.default.value,
                "&.Mui-disabled": { color: color.type.muted.value, opacity: 0.5 },
              }}
            >
              <Send size="md" />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function existingGroupToConversation(group: ExistingGroup): Conversation {
  return {
    id: `group-${group.id}`,
    name: group.name,
    initials: group.name.slice(0, 2).toUpperCase(),
    avatarColor: "blue",
    time: "",
    preview: "",
    isGroup: true,
    groupCount: group.participantIds.length,
  };
}

const NEW_GROUP_PLACEHOLDER: Conversation = {
  id: "__new_group__",
  name: "New group",
  initials: "NG",
  avatarColor: "blue",
  time: "",
  preview: "",
  isGroup: true,
};

function ActiveConversationHeader({
  recipients,
  groupName,
  onBack,
  onClose,
}: {
  recipients: Person[];
  groupName: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();

  const showOverflow = recipients.length > 2;
  const visibleAvatars = showOverflow ? recipients.slice(0, 1) : recipients.slice(0, 2);
  const overflowCount = showOverflow ? recipients.length - 1 : 0;
  const namesText = groupName.trim()
    ? groupName.trim()
    : recipients.map((r) => shortName(r.name)).join(", ");

  return (
    <Box sx={{ flexShrink: 0, borderBottom: `1px solid ${color.ui.divider.default.value}`, backgroundColor: "#fff" }}>
      <Stack direction="row" alignItems="center" sx={{ px: "8px", height: "56px", gap: "8px" }}>
        <IconButton size="small" onClick={onBack} aria-label="Back" sx={{ width: 32, height: 32, color: color.type.default.value }}>
          <ArrowLeftIcon size="md" />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {visibleAvatars.map((p, i) => {
            const avatarProps = AvatarPresets.getAvatarProps({ size: "small", color: p.avatarColor });
            const yellowOverride = p.avatarColor === "yellow"
              ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" }
              : {};
            return (
              <Avatar
                key={p.id}
                {...avatarProps}
                sx={{
                  ...avatarProps.sx,
                  ...yellowOverride,
                  width: 28,
                  height: 28,
                  fontSize: "11px",
                  border: "2px solid #fff",
                  marginLeft: i === 0 ? 0 : "-8px",
                }}
              >
                {p.initials}
              </Avatar>
            );
          })}
          {overflowCount > 0 && (
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "9999px",
                backgroundColor: color.surface.variant.value,
                color: color.type.default.value,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 600,
                border: "2px solid #fff",
                marginLeft: "-8px",
              }}
            >
              +{overflowCount}
            </Box>
          )}
        </Box>
        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "20px",
            color: color.type.default.value,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {namesText}
        </Typography>
        <IconButton size="small" aria-label="More options" sx={{ width: 32, height: 32, color: color.type.default.value }}>
          <MoreIcon size="md" />
        </IconButton>
        <IconButton size="small" onClick={onClose} aria-label="Close messenger" sx={{ width: 32, height: 32, color: color.type.default.value }}>
          <CloseIcon size="md" />
        </IconButton>
      </Stack>
    </Box>
  );
}

interface ActiveConversation {
  id: string;
  recipients: Person[];
  groupName: string;
  messages: Message[];
}

export default function MessengerPanel() {
  const { tokens: { semantic: { color } } } = useTheme();
  const { panelOpen, closePanel } = useMessenger();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [matchedGroup, setMatchedGroup] = useState<ExistingGroup | null>(null);
  const [composerRecipients, setComposerRecipients] = useState<Person[]>([]);
  const [composerGroupName, setComposerGroupName] = useState<string>("");
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(null);
  const [activeDraft, setActiveDraft] = useState("");

  const selectedConversation = selectedConversationId
    ? (conversations.find((c) => c.id === selectedConversationId) ??
       (() => {
         const groupId = selectedConversationId.startsWith("group-") ? selectedConversationId.slice(6) : null;
         const match = groupId ? EXISTING_GROUPS.find((g) => g.id === groupId) : null;
         return match ? existingGroupToConversation(match) : null;
       })())
    : null;

  const composerBackgroundConversation = matchedGroup
    ? existingGroupToConversation(matchedGroup)
    : NEW_GROUP_PLACEHOLDER;
  const composerBackgroundMessages = matchedGroup
    ? getThreadMessages(existingGroupToConversation(matchedGroup))
    : [];

  const openComposer = () => {
    setComposerOpen(true);
    setSelectedConversationId(null);
    setMatchedGroup(null);
    setComposerRecipients([]);
    setComposerGroupName("");
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setMatchedGroup(null);
    setComposerRecipients([]);
    setComposerGroupName("");
  };

  const dismissComposerKeepConversation = () => {
    if (matchedGroup) {
      setSelectedConversationId(`group-${matchedGroup.id}`);
    }
    setComposerOpen(false);
    setMatchedGroup(null);
  };

  const handleRecipientsChange = useCallback((recipients: Person[], groupName: string) => {
    setComposerRecipients(recipients);
    setComposerGroupName(groupName);
  }, []);

  const activateNewConversation = () => {
    if (composerRecipients.length === 0) return;
    setActiveConversation({
      id: `active-${Date.now()}`,
      recipients: composerRecipients,
      groupName: composerGroupName,
      messages: [],
    });
    setComposerOpen(false);
    setMatchedGroup(null);
    setActiveDraft("");
  };

  const sendActiveMessage = () => {
    if (!activeConversation) return;
    const text = activeDraft.trim();
    if (!text) return;
    const isFirst = activeConversation.messages.length === 0;
    const newMessage: Message = {
      id: `am-${Date.now()}`,
      sender: "John Doe",
      initials: "JD",
      avatarColor: "blue",
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      text,
    };
    const next: ActiveConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage],
    };
    setActiveConversation(next);
    setActiveDraft("");

    if (isFirst) {
      const isGroup = next.recipients.length > 1;
      const firstRecipient = next.recipients[0];
      const convo: Conversation = {
        id: next.id,
        name: next.groupName.trim()
          || (isGroup ? next.recipients.map((r) => shortName(r.name)).join(", ") : firstRecipient.name),
        initials: isGroup ? "NG" : firstRecipient.initials,
        avatarColor: isGroup ? "blue" : firstRecipient.avatarColor,
        time: "now",
        preview: text,
        isGroup,
        groupCount: isGroup ? next.recipients.length : undefined,
      };
      setConversations((cs) => [convo, ...cs]);
    } else {
      setConversations((cs) => cs.map((c) => c.id === next.id ? { ...c, preview: text, time: "now" } : c));
    }
  };

  const exitActiveConversation = () => {
    if (!activeConversation) return;
    if (activeConversation.messages.length === 0) {
      setComposerOpen(true);
      setComposerRecipients(activeConversation.recipients);
      setComposerGroupName(activeConversation.groupName);
    }
    setActiveConversation(null);
    setActiveDraft("");
  };

  const conversationToShow = composerOpen
    ? composerBackgroundConversation
    : selectedConversation;
  const messagesToShow = composerOpen
    ? composerBackgroundMessages
    : (selectedConversation ? getThreadMessages(selectedConversation) : []);

  const showThreadView = composerOpen || selectedConversation !== null;
  const showActiveView = activeConversation !== null;

  return (
    <Drawer
      anchor="right"
      open={panelOpen}
      variant="persistent"
      transitionDuration={600}
      sx={{
        width: panelOpen ? DRAWER_WIDTH + 24 : 0,
        minWidth: 0,
        overflow: "hidden",
        flexShrink: 0,
        height: "100%",
        transition: "width 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          padding: 0,
          gap: 0,
          border: `1px solid ${color.outline.fixed.value}`,
          boxShadow: "none",
          display: "flex",
          opacity: panelOpen ? 1 : 0,
          transform: panelOpen ? "none" : "translateX(8px)",
          transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1) !important",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "12px",
          marginTop: "12px",
          marginRight: "12px",
          marginBottom: "12px",
          marginLeft: "12px",
          position: "relative",
          height: "calc(100% - 24px)",
          backgroundColor: color.surface.default.value,
        },
      }}
    >
      {showActiveView && activeConversation ? (
        <>
          <ActiveConversationHeader
            recipients={activeConversation.recipients}
            groupName={activeConversation.groupName}
            onBack={exitActiveConversation}
            onClose={closePanel}
          />
          <ThreadView
            conversation={null}
            messages={activeConversation.messages}
            onBack={exitActiveConversation}
            hideSubheader
            inputValue={activeDraft}
            onInputChange={setActiveDraft}
            onSend={sendActiveMessage}
          />
        </>
      ) : showThreadView ? (
        <>
          {/* Messenger title bar (persists in thread view) */}
          <Box sx={{ flexShrink: 0, borderBottom: `1px solid ${color.ui.divider.default.value}`, backgroundColor: "#fff" }}>
            <Stack
              direction="row"
              alignItems="center"
              sx={{ px: "16px", height: "56px" }}
            >
              <Stack direction="row" alignItems="center" gap="12px" sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", color: color.type.default.value }}>
                  <MessagesIcon size="lg" />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: "20px", color: color.type.default.value }}>
                  Messenger
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap="16px">
                <IconButton size="small" aria-label="Open in new window" sx={{ width: 40, height: 40, borderRadius: "12px", padding: "8px", color: color.type.default.value }}>
                  <ExternalLinkIcon size="md" />
                </IconButton>
                <IconButton size="small" aria-label="More options" sx={{ width: 40, height: 40, borderRadius: "12px", padding: "8px", color: color.type.default.value }}>
                  <MoreIcon size="md" />
                </IconButton>
                <IconButton size="small" onClick={closePanel} aria-label="Close messenger" sx={{ width: 40, height: 40, borderRadius: "12px", padding: "8px", color: color.type.default.value }}>
                  <CloseIcon size="md" />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
          <ThreadView
            conversation={conversationToShow}
            messages={messagesToShow}
            onBack={() => {
              if (composerOpen) closeComposer();
              else setSelectedConversationId(null);
            }}
            hideSubheader={composerOpen}
            composerSlot={composerOpen ? (
              <GroupComposer
                onClose={closeComposer}
                onMatchedGroupChange={setMatchedGroup}
                onRecipientsChange={handleRecipientsChange}
                initialRecipients={composerRecipients}
                initialGroupName={composerGroupName}
              />
            ) : undefined}
            onBackgroundClick={
              composerOpen
                ? (matchedGroup
                    ? dismissComposerKeepConversation
                    : (composerRecipients.length > 0 ? activateNewConversation : undefined))
                : undefined
            }
            onComposerBarClick={
              composerOpen && !matchedGroup && composerRecipients.length > 0
                ? activateNewConversation
                : undefined
            }
          />
        </>
      ) : (
        <>
          {/* Header */}
          <Box sx={{ flexShrink: 0, borderBottom: `1px solid ${color.ui.divider.default.value}`, backgroundColor: "#fff" }}>
            <Stack
              direction="row"
              alignItems="center"
              sx={{ px: "16px", height: "56px" }}
            >
              <Stack direction="row" alignItems="center" gap="12px" sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", color: color.type.default.value }}>
                  <MessagesIcon size="lg" />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: "20px", color: color.type.default.value }}>
                  Messenger
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap="16px">
                <IconButton size="small" aria-label="Open in new window" sx={{ width: 40, height: 40, borderRadius: "12px", padding: "8px", color: color.type.default.value }}>
                  <ExternalLinkIcon size="md" />
                </IconButton>
                <IconButton size="small" aria-label="More options" sx={{ width: 40, height: 40, borderRadius: "12px", padding: "8px", color: color.type.default.value }}>
                  <MoreIcon size="md" />
                </IconButton>
                <IconButton size="small" onClick={closePanel} aria-label="Close messenger" sx={{ width: 40, height: 40, borderRadius: "12px", padding: "8px", color: color.type.default.value }}>
                  <CloseIcon size="md" />
                </IconButton>
              </Stack>
            </Stack>
          </Box>

          {/* Conversations header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              px: "12px",
              py: "12px",
              flexShrink: 0,
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
              boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.06)",
              backgroundColor: color.surface.default.value,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "14px", color: color.type.default.value }}>
                Conversations
              </Typography>
              <Box
                component="button"
                onClick={openComposer}
                aria-label="New conversation"
                sx={{
                  all: "unset",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  height: 24,
                  borderRadius: "12px",
                  background: color.action.primary.default.value,
                  color: "#fff",
                  px: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: "16px",
                  whiteSpace: "nowrap",
                  "&:hover": { background: color.action.primary.hover.value },
                }}
              >
                New +
              </Box>
            </Stack>
          </Box>

          {/* Conversation list */}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", background: "var(--Gradient-background-default, radial-gradient(125.08% 101.36% at 0% 0%, var(--Semantic-Color-Background-Base-gradient-start, #F9F9FC) 30.53%, var(--Semantic-Color-Background-Base-gradient-end, #FCFCFF) 100%))" }}>
            {conversations.map((conv) => (
              <ConversationItem key={conv.id} conversation={conv} onSelect={setSelectedConversationId} />
            ))}
          </Box>
        </>
      )}
    </Drawer>
  );
}
