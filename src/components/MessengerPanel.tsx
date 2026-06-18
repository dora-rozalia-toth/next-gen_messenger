import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Box, Chip, Divider, Drawer, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Popover, Stack, Tooltip, Typography, useTheme } from "@mui/material";
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
import Attach from "@diligentcorp/atlas-react-bundle/icons/Attach";
import ArrowUp from "@diligentcorp/atlas-react-bundle/icons/ArrowUp";
import Reply from "@diligentcorp/atlas-react-bundle/icons/Reply";
import FileIcon from "@diligentcorp/atlas-react-bundle/icons/File";
import Download from "@diligentcorp/atlas-react-bundle/icons/Download";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import SignOutIcon from "@diligentcorp/atlas-react-bundle/icons/SignOut";
import AlertOff from "@diligentcorp/atlas-react-bundle/icons/AlertOff";
import Email from "@diligentcorp/atlas-react-bundle/icons/Email";
import Call from "@diligentcorp/atlas-react-bundle/icons/Call";
import Building from "@diligentcorp/atlas-react-bundle/icons/Building";
import { useMessenger } from "../context/MessengerContext.js";
import GroupComposer from "./GroupComposer.js";
import { AddMemberView, GroupNameView, LeaveDialog, ParticipantsView } from "./GroupManagementViews.js";
import { type ExistingGroup, type Person, CURRENT_USER_ID, EXISTING_GROUPS, PEOPLE, personHasExistingConversation } from "../data/people.js";

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
  /** Optional rich HTML body. When present it is rendered instead of `text`. */
  html?: string;
  attachment?: { name: string; size: string };
  system?: boolean;
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

/**
 * Build the HTML for an @mention chip. Carries `data-mention-id` so the hover
 * contact card can look the person up. Mentions of the current user are tinted
 * with the purple accent token to set them apart.
 */
function mentionHtml(personId: string): string {
  const person = PEOPLE.find((p) => p.id === personId);
  if (!person) return "";
  const isMe = personId === CURRENT_USER_ID;
  const colorVar = isMe
    ? "var(--Semantic-Color-Accent-Purple-Content, #6E2C8B)"
    : "var(--Semantic-Color-Action-Primary-Default, #1C4EE4)";
  return `<span data-mention="true" data-mention-id="${personId}" style="color:${colorVar};font-weight:600;">@${person.name}</span>`;
}

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
    {
      id: "m8",
      ...other,
      time: "10:30 AM",
      text: "@John Doe just received this from Andrew, please take a look at it when you have the time.",
      html: `${mentionHtml(CURRENT_USER_ID)} just received this from Andrew, please take a look at it when you have the time.`,
      attachment: { name: "Finances_Q3", size: "24 MB" },
    },
    {
      id: "m9",
      ...me,
      time: "10:32 AM",
      text: "Will do. @Alice Martin can you confirm the figures on page 4 before I forward this?",
      html: `Will do. ${mentionHtml("p1")} can you confirm the figures on page 4 before I forward this?`,
    },
    {
      id: "m10",
      ...other,
      time: "10:35 AM",
      text: "@Alice Martin and @John Doe — looping you both in so we're aligned ahead of the board session.",
      html: `${mentionHtml("p1")} and ${mentionHtml(CURRENT_USER_ID)} — looping you both in so we're aligned ahead of the board session.`,
    },
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
  { emoji: "👍", label: "Like" },
  { emoji: "👎", label: "Dislike" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😡", label: "Angry" },
];

interface Reactor {
  id: string;
  name: string;
  initials: string;
  avatarColor: AvatarColor;
}

const CURRENT_USER_REACTOR: Reactor = {
  id: CURRENT_USER_ID,
  name: "John Doe",
  initials: "JD",
  avatarColor: "blue",
};

type MessageReactions = Record<string, Reactor[]>;

function ReactionPill({
  emoji,
  reactors,
  selected,
  onToggle,
}: {
  emoji: string;
  reactors: Reactor[];
  selected: boolean;
  onToggle: () => void;
}) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();

  const tooltipLabel = REACTIONS.find((r) => r.emoji === emoji)?.label ?? "";
  const count = reactors.length;

  return (
    <Tooltip
      arrow
      placement="top"
      title={
        <Stack direction="column" gap="8px" sx={{ minWidth: 120 }}>
          <Typography sx={{
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "16px",
            letterSpacing: "0.4px",
            color: color.type.muted.value,
          }}>
            {tooltipLabel}
          </Typography>
          <Stack direction="column" gap="8px">
            {reactors.map((person) => {
              const ap = AvatarPresets.getAvatarProps({ size: "small", color: person.avatarColor });
              const yellow = person.avatarColor === "yellow"
                ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" }
                : {};
              return (
                <Stack key={person.id} direction="row" alignItems="center" gap="4px">
                  <Avatar {...ap} sx={{ ...ap.sx, ...yellow, width: 24, height: 24, fontSize: "11px" }}>
                    {person.initials}
                  </Avatar>
                  <Typography sx={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: color.type.default.value,
                  }}>
                    {person.id === CURRENT_USER_ID ? "You" : person.name}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      }
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: color.surface.default.value,
            color: color.type.default.value,
            borderRadius: "12px",
            p: "16px",
            maxWidth: "none",
            boxShadow: "0px 0px 1px 0px rgba(0, 0, 0, 0.1), 0px 8px 8px 0px rgba(0, 0, 0, 0.1)",
          },
        },
        arrow: { sx: { color: color.surface.default.value } },
      }}
    >
      <Chip
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        label={
          <Stack direction="row" alignItems="center">
            <Box sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              fontSize: "16px",
              lineHeight: 1,
            }}>
              {emoji}
            </Box>
            {count > 1 && (
              <Box sx={{ display: "inline-flex", alignItems: "center", height: 24, pl: "2px", pr: "8px" }}>
                <Typography component="span" sx={{
                  fontSize: "var(--Semantic-Typography-Label-Sm-Size, 12px)",
                  fontWeight: 400,
                  lineHeight: "var(--Semantic-Typography-Label-Sm-Line-height, 16px)",
                  letterSpacing: "var(--Semantic-Typography-Label-Sm-Letter-spacing, 0.3px)",
                  fontFamily: "var(--Semantic-Typography-Label-Sm-Font, Inter)",
                  color: "inherit",
                }}>
                  {count}
                </Typography>
              </Box>
            )}
          </Stack>
        }
        sx={{
          height: 28,
          borderRadius: "9999px",
          maxWidth: "none",
          flexShrink: 0,
          backgroundColor: color.surface.default.value,
          color: color.type.default.value,
          border: `1px solid ${selected ? color.action.primary.default.value : color.outline.fixed.value}`,
          "& .MuiChip-label": {
            px: "2px",
            py: 0,
            overflow: "visible",
            textOverflow: "clip",
          },
          "&:hover": { backgroundColor: color.surface.default.value },
        }}
      />
    </Tooltip>
  );
}

/** Hover card showing a mentioned person's contact details. */
function ContactCard({ person }: { person: Person }) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();
  const ap = AvatarPresets.getAvatarProps({ size: "small", color: person.avatarColor });
  const yellow = person.avatarColor === "yellow"
    ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" }
    : {};
  const rows: { Icon: typeof Email; text: string }[] = [
    { Icon: Email, text: person.email },
    ...(person.phone ? [{ Icon: Call, text: person.phone }] : []),
    ...(person.company ? [{ Icon: Building, text: person.company }] : []),
  ];
  return (
    <Box
      data-contact-card="true"
      sx={{
        width: 280,
        backgroundColor: color.surface.default.value,
        borderRadius: "12px",
        boxShadow: "0px 0px 2px 0px rgba(0,0,0,0.1), 0px 8px 16px 0px rgba(0,0,0,0.1)",
        px: "16px",
        py: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Stack direction="row" alignItems="center" gap="8px">
        <Avatar {...ap} sx={{ ...ap.sx, ...yellow, width: 32, height: 32, fontSize: "11px" }}>
          {person.initials}
        </Avatar>
        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: color.type.default.value, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {person.name}
        </Typography>
      </Stack>
      <Box sx={{ height: "1px", width: "100%", backgroundColor: color.ui.divider.default.value }} />
      <Stack gap="4px">
        {rows.map(({ Icon, text }, i) => (
          <Stack key={i} direction="row" alignItems="center" gap="8px">
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: color.type.default.value, "& svg": { width: 20, height: 20 } }}>
              <Icon size="md" />
            </Box>
            <Typography sx={{ fontSize: "12px", color: color.type.muted.value, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {text}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function MessageItem({
  message,
  reactions,
  onToggleReaction,
  replyCount = 0,
  onOpenThread,
  showReplyAction = true,
  showInlineRepliesLink = true,
}: {
  message: Message;
  reactions: MessageReactions;
  onToggleReaction: (messageId: string, emoji: string) => void;
  replyCount?: number;
  onOpenThread?: (messageId: string) => void;
  showReplyAction?: boolean;
  showInlineRepliesLink?: boolean;
}) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();
  const avatarProps = AvatarPresets.getAvatarProps({ size: "medium", color: message.avatarColor });
  const yellowOverride = message.avatarColor === "yellow" ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" } : {};
  const [hovered, setHovered] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  const isOwnMessage = message.sender === "John Doe";
  const moreOpen = Boolean(moreAnchor);
  // Contact card shown when hovering an @mention chip inside the message body.
  const [cardPos, setCardPos] = useState<{ left: number; top: number } | null>(null);
  const [cardPerson, setCardPerson] = useState<Person | null>(null);

  const closeCard = useCallback(() => {
    setCardPos(null);
    setCardPerson(null);
  }, []);

  // While a card is open, watch the pointer globally and close it the instant
  // the cursor is over neither a mention chip nor the card. The card sits flush
  // against the mention (no gap), so closing immediately leaves no dead zone.
  // This also covers cases React's synthetic mouseleave misses (fast moves, the
  // innerHTML mention spans), which previously left cards stuck open.
  const cardOpen = Boolean(cardPos && cardPerson);
  useEffect(() => {
    if (!cardOpen) return;
    const onMove = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target?.closest("[data-mention-id]") && !target?.closest("[data-contact-card]")) closeCard();
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [cardOpen, closeCard]);

  // Open the card when the cursor enters a mention chip in the message body.
  const handleBodyOver = useCallback((e: React.MouseEvent) => {
    const span = (e.target as HTMLElement).closest("[data-mention-id]") as HTMLElement | null;
    if (!span) return;
    const person = PEOPLE.find((p) => p.id === span.getAttribute("data-mention-id"));
    if (person) {
      const rect = span.getBoundingClientRect();
      setCardPos({ left: rect.left, top: rect.top });
      setCardPerson(person);
    }
  }, []);

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
        px: "12px",
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
        <Typography
          component="div"
          onMouseOver={handleBodyOver}
          {...(message.html ? { dangerouslySetInnerHTML: { __html: message.html } } : {})}
          sx={{
            fontFamily: "var(--Semantic-Typography-Text-Body-Font, Inter)",
            fontSize: "var(--Semantic-Typography-Text-Body-Size, 14px)",
            fontWeight: 400,
            lineHeight: "var(--Semantic-Typography-Text-Body-Line-height, 20px)",
            letterSpacing: "var(--Semantic-Typography-Text-Body-Letter-spacing, 0.2px)",
            color: "var(--Semantic-Color-Type-Default, #242628)",
            wordBreak: "break-word",
            "& p": { m: 0 },
            "& ul, & ol": { m: 0, pl: "20px" },
            "& a": { color: "var(--Semantic-Color-Action-Primary-Default, #1C4EE4)" },
            "& [data-mention]": { cursor: "default" },
          }}
        >
          {message.html ? undefined : message.text}
        </Typography>
        <Popover
          open={Boolean(cardPos && cardPerson)}
          anchorReference="anchorPosition"
          anchorPosition={cardPos ? { left: cardPos.left, top: cardPos.top } : undefined}
          onClose={closeCard}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          disableAutoFocus
          disableEnforceFocus
          disableScrollLock
          hideBackdrop
          slotProps={{
            paper: {
              elevation: 0,
              square: true,
              sx: { p: 0, width: "max-content", overflow: "visible", backgroundColor: "transparent", backgroundImage: "none", boxShadow: "none" },
            },
          }}
          sx={{ pointerEvents: "none", "& .MuiPopover-paper": { pointerEvents: "auto" } }}
        >
          {cardPerson && <ContactCard person={cardPerson} />}
        </Popover>
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
        {showInlineRepliesLink && replyCount > 0 && (
          <Box
            component="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenThread?.(message.id);
            }}
            sx={{
              all: "unset",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              mt: "4px",
              color: color.action.primary.default.value,
              fontFamily: "var(--Semantic-Typography-Text-Md-Font, Inter)",
              fontSize: "12px",
              fontWeight: 600,
              lineHeight: "18px",
              alignSelf: "flex-start",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                "& svg": { width: 14, height: 14 },
              }}
            >
              <Reply size="md" />
            </Box>
            {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </Box>
        )}
        {Object.keys(reactions).length > 0 && (
          <Stack direction="row" gap="4px" flexWrap="wrap" sx={{ mt: "4px" }}>
            {REACTIONS.filter(({ emoji }) => (reactions[emoji]?.length ?? 0) > 0).map(({ emoji }) => {
              const reactors = reactions[emoji] ?? [];
              const selected = reactors.some((r) => r.id === CURRENT_USER_ID);
              return (
                <ReactionPill
                  key={emoji}
                  emoji={emoji}
                  reactors={reactors}
                  selected={selected}
                  onToggle={() => onToggleReaction(message.id, emoji)}
                />
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Hover actions toolbar */}
      {(hovered || moreOpen) && (
        <Stack
          direction="row"
          alignItems="center"
          gap="4px"
          sx={{
            position: "absolute",
            top: "-20px",
            right: "4px",
            zIndex: 2,
            backgroundColor: color.background.base.value,
            borderRadius: "var(--Semantic-Radius-Md, 8px)",
            boxShadow:
              "0px 0px 1px 0px rgba(0, 0, 0, 0.1), 0px 8px 8px 0px rgba(0, 0, 0, 0.1)",
            p: "4px",
          }}
        >
          <Stack direction="row" alignItems="center" gap="8px">
            {REACTIONS.map((reaction) => {
              const isMine = reactions[reaction.emoji]?.some((r) => r.id === CURRENT_USER_ID);
              return (
                <Tooltip key={reaction.label} title={reaction.label} arrow>
                  <Box
                    component="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleReaction(message.id, reaction.emoji);
                    }}
                    sx={{
                      all: "unset",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "var(--Semantic-Radius-Sm, 6px)",
                      fontSize: "18px",
                      lineHeight: 1,
                      backgroundColor: isMine ? color.action.secondary.hoverFill.value : "transparent",
                      "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
                    }}
                  >
                    {reaction.emoji}
                  </Box>
                </Tooltip>
              );
            })}
          </Stack>
          <Box sx={{ width: "1px", height: "24px", backgroundColor: color.ui.divider.default.value }} />
          {showReplyAction && (
            <Tooltip title="Reply in thread" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenThread?.(message.id);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--Semantic-Radius-Sm, 6px)",
                  color: color.type.default.value,
                  "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
                }}
              >
                <Reply size="md" />
              </IconButton>
            </Tooltip>
          )}
          {isOwnMessage && (
            <Tooltip title="More options" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreAnchor(e.currentTarget);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--Semantic-Radius-Sm, 6px)",
                  color: color.type.default.value,
                  "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
                }}
              >
                <MoreIcon size="md" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )}
      <Menu
        anchorEl={moreAnchor}
        open={moreOpen}
        onClose={() => setMoreAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 198,
              borderRadius: "8px",
              boxShadow: "0px 0px 1px 0px rgba(0, 0, 0, 0.1), 0px 8px 8px 0px rgba(0, 0, 0, 0.1)",
              border: "none",
            },
          },
          list: { sx: { py: 0 } },
        }}
      >
        <MenuItem
          onClick={() => {
            setMoreAnchor(null);
            onOpenThread?.(message.id);
          }}
          sx={{ px: "12px", py: "12px", gap: "8px" }}
        >
          <ListItemIcon sx={{ minWidth: "auto !important" }}><Reply size="lg" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ sx: { fontSize: "16px", lineHeight: "24px", letterSpacing: "0.2px" } }}>
            Reply in thread
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setMoreAnchor(null)} sx={{ px: "12px", py: "12px", gap: "8px" }}>
          <ListItemIcon sx={{ minWidth: "auto !important" }}><EditIcon size="lg" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ sx: { fontSize: "16px", lineHeight: "24px", letterSpacing: "0.2px" } }}>
            Edit
          </ListItemText>
        </MenuItem>
        <Divider sx={{ my: "0 !important", borderColor: `${color.ui.divider.default.value} !important` }} />
        <MenuItem
          onClick={() => setMoreAnchor(null)}
          sx={{
            px: "12px",
            py: "12px",
            gap: "8px",
            color: color.action.destructive.default.value,
            "& .MuiListItemText-primary, & .MuiListItemIcon-root": {
              color: `${color.action.destructive.default.value} !important`,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: "auto !important" }}><TrashIcon size="lg" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ sx: { fontSize: "16px", lineHeight: "24px", letterSpacing: "0.2px" } }}>
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

type RichFormat = "bold" | "italic" | "underline" | "strikeThrough" | "insertUnorderedList" | "insertOrderedList";

const TOOLBAR_GROUPS: { command: RichFormat; label: string; Icon: typeof FormatBold }[][] = [
  [
    { command: "bold", label: "Bold", Icon: FormatBold },
    { command: "italic", label: "Italic", Icon: FormatItalic },
    { command: "underline", label: "Underline", Icon: FormatUnderlined },
    { command: "strikeThrough", label: "Strikethrough", Icon: FormatStrikethrough },
  ],
  [
    { command: "insertUnorderedList", label: "Bulleted list", Icon: ListIcon },
    { command: "insertOrderedList", label: "Numbered list", Icon: ListNumbered },
  ],
];

/** Strip HTML to plain text so empty-detection and the `text` fallback stay accurate. */
function htmlToPlainText(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent ?? "").replace(/ /g, " ").trim();
}

/** Read-only / click-to-activate composer shell — matches the live composer chrome but does not edit. */
function ComposerPlaceholder({ onClick }: { onClick?: () => void }) {
  const { tokens: { semantic: { color } } } = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        flexShrink: 0,
        borderTop: `1px solid ${color.ui.divider.default.value}`,
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        backgroundColor: color.surface.default.value,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
    >
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
        {TOOLBAR_GROUPS.map((group, gi) => (
          <Stack key={gi} direction="row" gap={0} alignItems="center">
            {group.map(({ command, label, Icon }) => (
              <IconButton key={command} size="small" aria-label={label} disableRipple sx={{ width: 32, height: 32, color: color.type.default.value }}>
                <Icon size="md" />
              </IconButton>
            ))}
            {gi < TOOLBAR_GROUPS.length && <Divider orientation="vertical" flexItem sx={{ mx: "4px", my: "4px" }} />}
          </Stack>
        ))}
        <IconButton size="small" aria-label="Attach file" disableRipple sx={{ width: 32, height: 32, color: color.type.default.value }}>
          <Attach size="md" />
        </IconButton>
      </Box>
      <Box sx={{ px: "12px", pb: "12px" }}>
        <Box sx={{ pt: "12px", pb: "12px" }}>
          <Typography sx={{ fontSize: "16px", lineHeight: "24px", color: color.type.muted.value }}>
            Type something...
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <IconButton
            size="small"
            aria-label="Send message"
            disabled
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              border: `1px solid ${color.outline.fixed.value}`,
              color: color.type.default.value,
              "&.Mui-disabled": { color: color.type.muted.value, opacity: 0.5 },
            }}
          >
            <ArrowUp size="md" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}

/** A single @mention candidate. `all` is the special "Notify everyone" entry. */
type MentionCandidate =
  | { kind: "all"; label: string; sublabel: string }
  | { kind: "person"; person: Person };

/** Bold the substring of `name` that matches `query` (first, case-insensitive match). */
function highlightMatch(name: string, query: string) {
  const q = query.trim();
  if (!q) return name;
  const idx = name.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return name;
  return (
    <>
      {name.slice(0, idx)}
      <Box component="span" sx={{ fontWeight: 600 }}>
        {name.slice(idx, idx + q.length)}
      </Box>
      {name.slice(idx + q.length)}
    </>
  );
}

/** Floating "Suggestions" list shown while typing `@` in the composer. */
function MentionSuggestions({
  candidates,
  activeIndex,
  query,
  onPick,
}: {
  candidates: MentionCandidate[];
  activeIndex: number;
  query: string;
  onPick: (candidate: MentionCandidate) => void;
}) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: color.surface.default.value,
        borderRadius: "12px",
        boxShadow: "0px 0px 2px 0px rgba(0,0,0,0.1), 0px 8px 16px 0px rgba(0,0,0,0.1)",
        overflow: "hidden",
        width: 300,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", px: "12px", py: "12px" }}>
        <Typography sx={{ fontSize: "11px", letterSpacing: "0.4px", color: color.type.muted.value }}>
          Suggestions
        </Typography>
      </Box>
      <Box sx={{ maxHeight: 260, overflowY: "auto", pb: "4px" }}>
        {candidates.map((c, i) => {
          const active = i === activeIndex;
          const name = c.kind === "all" ? c.label : c.person.name;
          const sub = c.kind === "all" ? c.sublabel : c.person.email;
          const avatarColor = c.kind === "person" ? c.person.avatarColor : "blue";
          const ap = AvatarPresets.getAvatarProps({ size: "small", color: avatarColor });
          const yellow = avatarColor === "yellow"
            ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" }
            : {};
          return (
            <Box
              key={c.kind === "all" ? "__all__" : c.person.id}
              role="option"
              aria-selected={active}
              onMouseDown={(e: React.MouseEvent) => {
                e.preventDefault();
                onPick(c);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                px: "12px",
                py: "8px",
                cursor: "pointer",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
              }}
            >
              {c.kind === "all" ? (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "9999px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "var(--Semantic-Color-Accent-Gray-Background, #DEE0E9)",
                    color: color.type.default.value,
                  }}
                >
                  <GroupIcon size="md" />
                </Box>
              ) : (
                <Avatar {...ap} sx={{ ...ap.sx, ...yellow, width: 32, height: 32, fontSize: "11px" }}>
                  {c.person.initials}
                </Avatar>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "14px", lineHeight: "20px", color: color.type.default.value, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.kind === "person" ? highlightMatch(name, query) : name}
                </Typography>
                <Typography sx={{ fontSize: "12px", lineHeight: "16px", color: color.type.muted.value, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {sub}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function RichTextComposer({ onSendMessage, participants = [] }: { onSendMessage: (html: string, text: string) => void; participants?: Person[] }) {
  const { tokens: { semantic: { color } } } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  // @-mention popover state. `query` is the text typed after the active `@`.
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  // Screen position of the active `@` glyph — the popover's left/bottom anchor.
  const [mentionAnchor, setMentionAnchor] = useState<{ left: number; top: number } | null>(null);

  // Build the suggestion list: "All" first, then participants matching the query.
  const mentionCandidates = useMemo<MentionCandidate[]>(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.trim().toLowerCase();
    const people = participants.filter((p) => p.id !== CURRENT_USER_ID && p.name.toLowerCase().includes(q));
    const all: MentionCandidate[] = "all".includes(q) || q === ""
      ? [{ kind: "all", label: "All", sublabel: "Notify everyone in this conversation" }]
      : [];
    return [...all, ...people.map((p): MentionCandidate => ({ kind: "person", person: p }))];
  }, [mentionQuery, participants]);

  const closeMentions = useCallback(() => {
    setMentionQuery(null);
    setMentionIndex(0);
    setMentionAnchor(null);
  }, []);

  // Read the word immediately before the caret; open the popover when it's an `@token`.
  const detectMention = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return closeMentions();
    const node = sel.anchorNode;
    if (!node || node.nodeType !== Node.TEXT_NODE) return closeMentions();
    const text = (node.textContent ?? "").slice(0, sel.anchorOffset);
    const match = /(?:^|\s)@([^\s@]*)$/.exec(text);
    if (match) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
      // Anchor the popover to the `@` glyph so it tracks the caret horizontally.
      const atIndex = sel.anchorOffset - match[1].length - 1;
      const atRange = document.createRange();
      atRange.setStart(node, atIndex);
      atRange.setEnd(node, atIndex + 1);
      const rect = atRange.getBoundingClientRect();
      setMentionAnchor({ left: rect.left, top: rect.top });
    } else {
      closeMentions();
    }
  }, [closeMentions]);

  // Replace the active `@query` token with a styled mention chip + trailing space.
  const insertMention = useCallback((candidate: MentionCandidate) => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const offset = sel.anchorOffset;
    const before = (node.textContent ?? "").slice(0, offset);
    const match = /(^|\s)@([^\s@]*)$/.exec(before);
    if (!match) return;
    const start = offset - match[2].length - 1; // include the '@'
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, offset);
    range.deleteContents();

    const label = candidate.kind === "all" ? "All" : candidate.person.name;
    const mention = document.createElement("span");
    mention.setAttribute("data-mention", "true");
    if (candidate.kind === "person") mention.setAttribute("data-mention-id", candidate.person.id);
    mention.contentEditable = "false";
    mention.textContent = `@${label}`;
    // Current user mentions are tinted purple to set them apart.
    mention.style.color = candidate.kind === "person" && candidate.person.id === CURRENT_USER_ID
      ? color.accent.purple.content.value
      : color.action.primary.default.value;
    mention.style.fontWeight = "600";
    range.insertNode(mention);

    // Trailing space so typing continues normally after the chip.
    const space = document.createTextNode(" ");
    mention.after(space);
    const after = document.createRange();
    after.setStartAfter(space);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);

    el.focus();
    closeMentions();
    setIsEmpty(htmlToPlainText(el.innerHTML).length === 0);
  }, [closeMentions, color.action.primary.default.value]);

  const refreshState = useCallback(() => {
    const el = editorRef.current;
    if (el) setIsEmpty(htmlToPlainText(el.innerHTML).length === 0);
    const next: Record<string, boolean> = {};
    for (const group of TOOLBAR_GROUPS) {
      for (const { command } of group) {
        try {
          next[command] = document.queryCommandState(command);
        } catch {
          next[command] = false;
        }
      }
    }
    setActiveFormats(next);
    detectMention();
  }, [detectMention]);

  const applyFormat = useCallback((command: RichFormat) => {
    editorRef.current?.focus();
    document.execCommand(command);
    refreshState();
  }, [refreshState]);

  const send = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    const text = htmlToPlainText(html);
    if (!text) return;
    onSendMessage(html, text);
    el.innerHTML = "";
    setIsEmpty(true);
    setActiveFormats({});
    closeMentions();
  }, [onSendMessage, closeMentions]);

  const mentionOpen = mentionQuery !== null && mentionCandidates.length > 0;

  return (
    <Box
      sx={{
        flexShrink: 0,
        borderTop: `1px solid ${color.ui.divider.default.value}`,
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        backgroundColor: color.surface.default.value,
        overflow: "hidden",
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
        {TOOLBAR_GROUPS.map((group, gi) => (
          <Stack key={gi} direction="row" gap={0} alignItems="center">
            {group.map(({ command, label, Icon }) => {
              const active = activeFormats[command];
              return (
                <Tooltip key={command} title={label} arrow>
                  <IconButton
                    size="small"
                    aria-label={label}
                    aria-pressed={active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFormat(command)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--Semantic-Radius-Sm, 6px)",
                      color: active ? color.action.primary.default.value : color.type.default.value,
                      backgroundColor: active ? color.action.secondary.hoverFill.value : "transparent",
                      "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
                    }}
                  >
                    <Icon size="md" />
                  </IconButton>
                </Tooltip>
              );
            })}
            {gi < TOOLBAR_GROUPS.length && <Divider orientation="vertical" flexItem sx={{ mx: "4px", my: "4px" }} />}
          </Stack>
        ))}
        <Tooltip title="Attach file" arrow>
          <IconButton
            size="small"
            aria-label="Attach file"
            sx={{
              width: 32,
              height: 32,
              borderRadius: "var(--Semantic-Radius-Sm, 6px)",
              color: color.type.default.value,
              "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
            }}
          >
            <Attach size="md" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editor + send */}
      <Box sx={{ px: "12px", pb: "12px", position: "relative" }}>
        {/* @mention suggestions — portaled so the composer's overflow:hidden can't clip it */}
        <Popover
          open={mentionOpen}
          anchorReference="anchorPosition"
          anchorPosition={mentionAnchor ? { left: mentionAnchor.left, top: mentionAnchor.top } : undefined}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          disableAutoFocus
          disableEnforceFocus
          disableScrollLock
          hideBackdrop
          slotProps={{
            paper: {
              elevation: 0,
              square: true,
              sx: { mt: "-8px", p: 0, m: 0, width: "max-content", overflow: "visible", backgroundColor: "transparent", backgroundImage: "none", boxShadow: "none" },
            },
          }}
          sx={{ pointerEvents: "none", "& .MuiPopover-paper": { pointerEvents: "auto" } }}
        >
          <MentionSuggestions
            candidates={mentionCandidates}
            activeIndex={mentionIndex}
            query={mentionQuery ?? ""}
            onPick={insertMention}
          />
        </Popover>
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Message"
          data-placeholder="Type something..."
          onInput={refreshState}
          onKeyUp={refreshState}
          onMouseUp={refreshState}
          onBlur={closeMentions}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (mentionOpen) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setMentionIndex((i) => (i + 1) % mentionCandidates.length);
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setMentionIndex((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length);
                return;
              }
              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                insertMention(mentionCandidates[mentionIndex]);
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                closeMentions();
                return;
              }
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          sx={{
            minHeight: "24px",
            pt: "12px",
            pb: "12px",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "16px",
            lineHeight: "24px",
            color: color.type.default.value,
            wordBreak: "break-word",
            "& p": { m: 0 },
            "& ul, & ol": { m: 0, pl: "20px" },
            "&:empty:before": {
              content: "attr(data-placeholder)",
              color: color.type.muted.value,
              pointerEvents: "none",
            },
          }}
        />
        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <IconButton
            size="small"
            aria-label="Send message"
            onMouseDown={(e) => e.preventDefault()}
            onClick={send}
            disabled={isEmpty}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              border: `1px solid ${color.outline.fixed.value}`,
              color: color.type.default.value,
              "&.Mui-disabled": { color: color.type.muted.value, opacity: 0.5 },
            }}
          >
            <ArrowUp size="md" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}

interface ThreadViewProps {
  conversation: Conversation | null;
  messages: Message[];
  onBack: () => void;
  hideSubheader?: boolean;
  subheaderSlot?: React.ReactNode;
  composerSlot?: React.ReactNode;
  onBackgroundClick?: () => void;
  onComposerBarClick?: () => void;
  onSendMessage?: (html: string, text: string) => void;
  participants?: Person[];
  reactionsByMessage?: Record<string, MessageReactions>;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  replyCounts?: Record<string, number>;
  onOpenThread?: (messageId: string) => void;
  showTodayDivider?: boolean;
  threadSeparatorAfterId?: string;
  threadSeparatorCount?: number;
  parentMessageId?: string;
}

function ThreadView({ conversation, messages, onBack, hideSubheader, subheaderSlot, composerSlot, onBackgroundClick, onComposerBarClick, onSendMessage, participants, reactionsByMessage, onToggleReaction, replyCounts, onOpenThread, showTodayDivider = true, threadSeparatorAfterId, threadSeparatorCount, parentMessageId }: ThreadViewProps) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();
  const avatarColor = conversation?.avatarColor ?? "blue";
  const avatarProps = AvatarPresets.getAvatarProps({ size: "small", color: avatarColor });
  const yellowOverride = avatarColor === "yellow" ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" } : {};
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [conversation?.id, messages.length]);

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
        {subheaderSlot}
        {!hideSubheader && !subheaderSlot && conversation && (
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
              left: 0,
              right: 0,
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
              {conversation?.isGroup
                ? "You are starting a new group chat"
                : `You are starting a new chat${conversation?.name ? ` with ${conversation.name}` : ""}`}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: color.type.muted.value }}>
              Type your first message below
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", pt: parentMessageId ? "16px" : 0, pb: "8px" }}>
            {messages.map((msg, index) => (
              <Box key={msg.id}>
                {showTodayDivider && index === todayIndex && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "4px", px: "12px", py: "8px", mb: "16px" }}>
                    <Divider sx={{ flex: 1 }} />
                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: color.type.muted.value, px: "4px" }}>
                      Today
                    </Typography>
                    <Divider sx={{ flex: 1 }} />
                  </Box>
                )}
                {msg.system ? (
                  <Box sx={{ display: "flex", justifyContent: "center", px: "16px", py: "8px" }}>
                    <Typography sx={{ fontSize: "12px", color: color.type.muted.value, textAlign: "center", lineHeight: "18px" }}>
                      {msg.text}
                    </Typography>
                  </Box>
                ) : (
                  <MessageItem
                    message={msg}
                    reactions={reactionsByMessage?.[msg.id] ?? {}}
                    onToggleReaction={onToggleReaction ?? (() => {})}
                    replyCount={replyCounts?.[msg.id] ?? 0}
                    onOpenThread={onOpenThread}
                    showReplyAction={msg.id !== parentMessageId}
                    showInlineRepliesLink={msg.id !== parentMessageId}
                  />
                )}
                {threadSeparatorAfterId === msg.id && threadSeparatorCount !== undefined && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px", px: "16px", py: "8px", mt: "8px" }}>
                    <Stack direction="row" alignItems="center" gap="4px">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: color.type.muted.value,
                          "& svg": { width: 14, height: 14 },
                        }}
                      >
                        <Reply size="md" />
                      </Box>
                      <Typography sx={{ fontSize: "12px", fontWeight: 600, color: color.type.muted.value }}>
                        {threadSeparatorCount} {threadSeparatorCount === 1 ? "Reply" : "Replies"}
                      </Typography>
                    </Stack>
                    <Divider sx={{ flex: 1 }} />
                  </Box>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
        </Box>
      </Box>

      {/* Input area */}
      {onSendMessage ? (
        <RichTextComposer onSendMessage={onSendMessage} participants={participants} />
      ) : (
        <ComposerPlaceholder onClick={onComposerBarClick} />
      )}
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

function personToConversation(person: Person): Conversation {
  return {
    id: `person-${person.id}`,
    name: person.name,
    initials: person.initials,
    avatarColor: person.avatarColor,
    time: "",
    preview: "",
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

function MessengerTitleBar({ onClose }: { onClose: () => void }) {
  const { tokens: { semantic: { color } } } = useTheme();
  return (
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
          <IconButton size="small" onClick={onClose} aria-label="Close messenger" sx={{ width: 40, height: 40, borderRadius: "12px", padding: "8px", color: color.type.default.value }}>
            <CloseIcon size="md" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}

function ActiveConversationHeader({
  recipients,
  groupName,
  isGroup,
  onBack,
  onMoreClick,
}: {
  recipients: Person[];
  groupName: string;
  isGroup: boolean;
  onBack: () => void;
  onMoreClick?: (anchor: HTMLElement) => void;
}) {
  const { tokens: { semantic: { color } }, presets: { AvatarPresets } } = useTheme();

  const showOverflow = recipients.length > 2;
  const visibleAvatars = showOverflow ? recipients.slice(0, 1) : recipients.slice(0, 2);
  const overflowCount = showOverflow ? recipients.length - 1 : 0;
  const namesText = groupName.trim()
    ? groupName.trim()
    : recipients.map((r) => shortName(r.name)).join(", ");

  return (
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
      <IconButton sx={{ p: "4px", width: 32, height: 32 }} onClick={onBack} title="Back" aria-label="Back">
        <ArrowLeftIcon size="lg" />
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
                width: 32,
                height: 32,
                fontSize: "12px",
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
              width: 32,
              height: 32,
              borderRadius: "9999px",
              backgroundColor: color.surface.variant.value,
              color: color.type.default.value,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
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
      <IconButton
        sx={{ p: "4px", width: 32, height: 32 }}
        title="More options"
        aria-label="More options"
        onClick={isGroup && onMoreClick ? (e) => onMoreClick(e.currentTarget) : undefined}
      >
        <MoreIcon size="lg" />
      </IconButton>
    </Stack>
  );
}

function ThreadSubheader({ onBack }: { onBack: () => void }) {
  const { tokens: { semantic: { color } } } = useTheme();
  return (
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
      <IconButton sx={{ p: "4px", width: 32, height: 32 }} onClick={onBack} title="Back" aria-label="Back to conversation">
        <ArrowLeftIcon size="lg" />
      </IconButton>
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
        Thread
      </Typography>
      <IconButton sx={{ p: "4px", width: 32, height: 32 }} title="Mute thread" aria-label="Mute thread">
        <AlertOff size="lg" />
      </IconButton>
    </Stack>
  );
}

interface ActiveConversation {
  id: string;
  recipients: Person[];
  groupName: string;
  ownerId: string;
  messages: Message[];
}

type GroupView = "thread" | "participants" | "group-name" | "add-member" | "reply-thread";

type RepliesByMessageId = Record<string, Message[]>;

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
  const [groupView, setGroupView] = useState<GroupView>("thread");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  const [threadParentId, setThreadParentId] = useState<string | null>(null);
  // Messages the user appends to a read-only/selected conversation, keyed by conversation id.
  const [sentByConversation, setSentByConversation] = useState<Record<string, Message[]>>({});
  const [repliesByMessage, setRepliesByMessage] = useState<RepliesByMessageId>(() => {
    const me = { sender: "John Doe", initials: "JD", avatarColor: "blue" as AvatarColor };
    const laura = { sender: "Laura Adams", initials: "LA", avatarColor: "yellow" as AvatarColor };
    return {
      m5: [
        { id: "m5-r1", ...laura, time: "10:02 AM", text: "His assistant said he has a conflicting appointment across town, so I've asked IT to test his video link in advance and keep someone on standby in case he has connection issues during the meeting." },
        { id: "m5-r2", ...me, time: "09:49 AM", text: "Good thinking. I'd rather avoid technical delays in front of the board." },
        { id: "m5-r3", ...laura, time: "09:49 AM", text: "Completely agree. I've learned that even a small issue at the start can throw off the tone of the whole meeting, so I'm trying to remove as much friction as possible before everyone arrives." },
      ],
    };
  });
  const [reactionsByMessage, setReactionsByMessage] = useState<Record<string, MessageReactions>>(() => {
    const findP = (id: string): Reactor | null => {
      const p = PEOPLE.find((x) => x.id === id);
      return p ? { id: p.id, name: p.name, initials: p.initials, avatarColor: p.avatarColor } : null;
    };
    const make = (...ids: string[]) => ids.map(findP).filter((r): r is Reactor => Boolean(r));
    return {
      m2: { "👍": make("p5", "p1", "p6") },
      m4: { "❤️": make("p5"), "😂": make("p1", "p2") },
      m6: { "👍": make("p1"), "❤️": make("p4", "p6") },
      m8: { "👎": make("p3"), "😡": make("p2", "p7") },
    };
  });

  const replyCounts: Record<string, number> = {};
  for (const [mid, list] of Object.entries(repliesByMessage)) replyCounts[mid] = list.length;

  const openThread = useCallback((messageId: string) => {
    setThreadParentId(messageId);
  }, []);

  const closeThread = useCallback(() => {
    setThreadParentId(null);
  }, []);

  const sendThreadReply = useCallback((html: string, text: string) => {
    if (!threadParentId || !text) return;
    const reply: Message = {
      id: `tr-${Date.now()}`,
      sender: "John Doe",
      initials: "JD",
      avatarColor: "blue",
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      text,
      html,
    };
    setRepliesByMessage((prev) => ({
      ...prev,
      [threadParentId]: [...(prev[threadParentId] ?? []), reply],
    }));
  }, [threadParentId]);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setReactionsByMessage((prev) => {
      const current = prev[messageId] ?? {};
      // remove the current user from every emoji bucket on this message first
      const stripped: MessageReactions = {};
      for (const [e, reactors] of Object.entries(current)) {
        const filtered = reactors.filter((r) => r.id !== CURRENT_USER_ID);
        if (filtered.length > 0) stripped[e] = filtered;
      }
      const wasMine = (current[emoji] ?? []).some((r) => r.id === CURRENT_USER_ID);
      if (!wasMine) {
        stripped[emoji] = [...(stripped[emoji] ?? []), CURRENT_USER_REACTOR];
      }
      const nextEntry = stripped;
      const next = { ...prev };
      if (Object.keys(nextEntry).length === 0) {
        delete next[messageId];
      } else {
        next[messageId] = nextEntry;
      }
      return next;
    });
  }, []);

  const selectedConversation = selectedConversationId
    ? (conversations.find((c) => c.id === selectedConversationId) ??
       (() => {
         if (selectedConversationId.startsWith("group-")) {
           const match = EXISTING_GROUPS.find((g) => g.id === selectedConversationId.slice(6));
           return match ? existingGroupToConversation(match) : null;
         }
         if (selectedConversationId.startsWith("person-")) {
           const person = PEOPLE.find((p) => p.id === selectedConversationId.slice(7));
           return person ? personToConversation(person) : null;
         }
         return null;
       })())
    : null;

  // Participants offered as @mention candidates for the selected conversation.
  const selectedConversationParticipants: Person[] = (() => {
    if (!selectedConversationId) return [];
    if (selectedConversationId.startsWith("group-")) {
      const group = EXISTING_GROUPS.find((g) => g.id === selectedConversationId.slice(6));
      return group
        ? group.participantIds.map((id) => PEOPLE.find((p) => p.id === id)).filter((p): p is Person => Boolean(p))
        : [];
    }
    if (selectedConversationId.startsWith("person-")) {
      const person = PEOPLE.find((p) => p.id === selectedConversationId.slice(7));
      return person ? [person] : [];
    }
    if (selectedConversation?.isGroup) {
      const total = selectedConversation.groupCount ?? 5;
      return PEOPLE.filter((p) => p.id !== CURRENT_USER_ID).slice(0, Math.max(1, total - 1));
    }
    // 1-on-1 list conversation: synthesize a person from the conversation header.
    return selectedConversation
      ? [{ id: selectedConversation.id, name: selectedConversation.name, initials: selectedConversation.initials, email: "", avatarColor: selectedConversation.avatarColor }]
      : [];
  })();

  // Background preview rules while composing:
  //   1 recipient → load that person's 1-on-1 thread
  //   2 recipients with a matched group → that group's thread
  //   3+ recipients OR forced new group → empty placeholder
  const singleRecipient = composerRecipients.length === 1 ? composerRecipients[0] : null;
  // A sole recipient with no message history behaves like a brand-new group:
  // clicking the background/composer bar starts the conversation rather than
  // re-opening a (non-existent) saved thread.
  const singleRecipientWithThread =
    singleRecipient && personHasExistingConversation(singleRecipient.id) ? singleRecipient : null;
  const composerBackgroundConversation = matchedGroup
    ? existingGroupToConversation(matchedGroup)
    : singleRecipient
      ? personToConversation(singleRecipient)
      : NEW_GROUP_PLACEHOLDER;
  const composerBackgroundMessages = matchedGroup
    ? getThreadMessages(existingGroupToConversation(matchedGroup))
    : singleRecipient && personHasExistingConversation(singleRecipient.id)
      ? getThreadMessages(personToConversation(singleRecipient))
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
      openSeededGroup(matchedGroup);
    } else if (singleRecipient) {
      setSelectedConversationId(`person-${singleRecipient.id}`);
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
      ownerId: CURRENT_USER_ID,
      messages: [],
    });
    setComposerOpen(false);
    setMatchedGroup(null);
    setGroupView("thread");
  };

  const openSeededGroup = (group: ExistingGroup) => {
    const recipients = group.participantIds
      .map((id) => PEOPLE.find((p) => p.id === id))
      .filter((p): p is Person => Boolean(p));
    setActiveConversation({
      id: `group-${group.id}`,
      recipients,
      groupName: group.name,
      ownerId: group.ownerId,
      messages: getThreadMessages(existingGroupToConversation(group)),
    });
    setGroupView("thread");
  };

  const openListGroup = (convo: Conversation) => {
    const total = convo.groupCount ?? 5;
    const recipients = PEOPLE
      .filter((p) => p.id !== CURRENT_USER_ID)
      .slice(0, Math.max(1, total - 1));
    setActiveConversation({
      id: convo.id,
      recipients,
      groupName: convo.name,
      ownerId: CURRENT_USER_ID,
      messages: getThreadMessages(convo),
    });
    setGroupView("thread");
  };

  const handleSelectConversation = (id: string) => {
    if (id.startsWith("group-")) {
      const groupId = id.slice(6);
      const group = EXISTING_GROUPS.find((g) => g.id === groupId);
      if (group) {
        openSeededGroup(group);
        return;
      }
    }
    const convo = conversations.find((c) => c.id === id);
    if (convo?.isGroup) {
      openListGroup(convo);
      return;
    }
    setSelectedConversationId(id);
  };

  const sendActiveMessage = (html: string, text: string) => {
    if (!activeConversation || !text) return;
    const isFirst = activeConversation.messages.length === 0;
    const newMessage: Message = {
      id: `am-${Date.now()}`,
      sender: "John Doe",
      initials: "JD",
      avatarColor: "blue",
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      text,
      html,
    };
    const next: ActiveConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage],
    };
    setActiveConversation(next);

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
    setActiveConversation(null);
  };

  const sendSelectedMessage = (html: string, text: string) => {
    if (!selectedConversation || !text) return;
    const id = selectedConversation.id;
    const newMessage: Message = {
      id: `sm-${Date.now()}`,
      sender: "John Doe",
      initials: "JD",
      avatarColor: "blue",
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      text,
      html,
    };
    setSentByConversation((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), newMessage],
    }));
    setConversations((cs) => cs.map((c) => c.id === id ? { ...c, preview: text, time: "now" } : c));
  };

  const conversationToShow = composerOpen
    ? composerBackgroundConversation
    : selectedConversation;
  const messagesToShow = composerOpen
    ? composerBackgroundMessages
    : (selectedConversation
        ? [...getThreadMessages(selectedConversation), ...(sentByConversation[selectedConversation.id] ?? [])]
        : []);

  const showThreadView = composerOpen || selectedConversation !== null;
  const showActiveView = activeConversation !== null;

  const findMessageById = (id: string): Message | null => {
    if (activeConversation) {
      const m = activeConversation.messages.find((x) => x.id === id);
      if (m) return m;
    }
    if (selectedConversation) {
      const m = getThreadMessages(selectedConversation).find((x) => x.id === id);
      if (m) return m;
    }
    if (composerOpen) {
      const m = composerBackgroundMessages.find((x) => x.id === id);
      if (m) return m;
    }
    return null;
  };

  const threadParent = threadParentId ? findMessageById(threadParentId) : null;
  const threadReplies = threadParentId ? (repliesByMessage[threadParentId] ?? []) : [];
  const threadMessages: Message[] = threadParent ? [threadParent, ...threadReplies] : [];
  const showThreadSubview = threadParent !== null;

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
          <MessengerTitleBar onClose={closePanel} />
          {groupView === "participants" ? (
            <ParticipantsView
              groupName={activeConversation.groupName || activeConversation.recipients.map((r) => shortName(r.name)).join(", ")}
              recipients={activeConversation.recipients}
              ownerId={activeConversation.ownerId}
              onBack={() => setGroupView("thread")}
              onAddMember={() => setGroupView("add-member")}
            />
          ) : groupView === "add-member" ? (
            <AddMemberView
              existingIds={activeConversation.recipients.map((r) => r.id)}
              onBack={() => setGroupView("participants")}
              onCancel={() => setGroupView("participants")}
              onAdd={(people, shareHistory) => {
                if (people.length === 0) {
                  setGroupView("participants");
                  return;
                }
                const namesList = people.map((p) => p.name);
                const namesText = namesList.length === 1
                  ? namesList[0]
                  : namesList.length === 2
                    ? `${namesList[0]} and ${namesList[1]}`
                    : `${namesList.slice(0, -1).join(", ")}, and ${namesList[namesList.length - 1]}`;
                const verb = people.length === 1 ? "was" : "were";
                const historyClause = shareHistory
                  ? "The full message history was shared with them."
                  : "Previous messages were not shared with them.";
                const systemMessage: Message = {
                  id: `sys-${Date.now()}`,
                  sender: "system",
                  initials: "",
                  avatarColor: "blue",
                  time: "",
                  text: `${namesText} ${verb} added to the group. ${historyClause}`,
                  system: true,
                };
                setActiveConversation({
                  ...activeConversation,
                  recipients: [...activeConversation.recipients, ...people],
                  messages: [...activeConversation.messages, systemMessage],
                });
                setGroupView("thread");
              }}
            />
          ) : groupView === "group-name" ? (
            <GroupNameView
              initialName={activeConversation.groupName}
              onBack={() => setGroupView("thread")}
              onCancel={() => setGroupView("thread")}
              onSave={(name) => {
                const previousName = activeConversation.groupName.trim();
                const nextName = name.trim();
                const renameMessage: Message = {
                  id: `sys-${Date.now()}`,
                  sender: "system",
                  initials: "",
                  avatarColor: "blue",
                  time: "",
                  text: previousName
                    ? `Group name changed from "${previousName}" to "${nextName}".`
                    : `Group name set to "${nextName}".`,
                  system: true,
                };
                setActiveConversation({
                  ...activeConversation,
                  groupName: name,
                  messages: [...activeConversation.messages, renameMessage],
                });
                setConversations((cs) => cs.map((c) => c.id === activeConversation.id ? { ...c, name: name || c.name } : c));
                setGroupView("thread");
              }}
            />
          ) : showThreadSubview ? (
            <ThreadView
              conversation={null}
              messages={threadMessages}
              onBack={closeThread}
              subheaderSlot={<ThreadSubheader onBack={closeThread} />}
              onSendMessage={sendThreadReply}
              reactionsByMessage={reactionsByMessage}
              onToggleReaction={toggleReaction}
              replyCounts={replyCounts}
              showTodayDivider={false}
              parentMessageId={threadParentId ?? undefined}
              threadSeparatorAfterId={threadReplies.length > 0 ? threadParentId ?? undefined : undefined}
              threadSeparatorCount={threadReplies.length > 0 ? threadReplies.length : undefined}
            />
          ) : (
            <ThreadView
              conversation={null}
              messages={activeConversation.messages}
              onBack={exitActiveConversation}
              subheaderSlot={
                <ActiveConversationHeader
                  recipients={activeConversation.recipients}
                  groupName={activeConversation.groupName}
                  isGroup={activeConversation.recipients.length > 1}
                  onBack={exitActiveConversation}
                  onMoreClick={(anchor) => setMoreAnchor(anchor)}
                />
              }
              onSendMessage={sendActiveMessage}
              participants={activeConversation.recipients}
              reactionsByMessage={reactionsByMessage}
              onToggleReaction={toggleReaction}
              replyCounts={replyCounts}
              onOpenThread={openThread}
            />
          )}
          <Menu
            anchorEl={moreAnchor}
            open={Boolean(moreAnchor)}
            onClose={() => setMoreAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 180,
                  borderRadius: "8px",
                  boxShadow: "0px 4px 12px 0px rgba(0, 0, 0, 0.12)",
                  border: `1px solid ${color.outline.fixed.value}`,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setMoreAnchor(null);
                setGroupView("participants");
              }}
            >
              <ListItemIcon><GroupIcon size="md" /></ListItemIcon>
              <ListItemText>Participants</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMoreAnchor(null);
                setGroupView("group-name");
              }}
            >
              <ListItemIcon><EditIcon size="md" /></ListItemIcon>
              <ListItemText>Group name</ListItemText>
            </MenuItem>
            <Divider sx={{ my: "0 !important", borderColor: "#DEE0E9 !important" }} />
            <MenuItem
              onClick={() => {
                setMoreAnchor(null);
                setLeaveOpen(true);
              }}
              sx={{
                color: color.action.destructive.default.value,
                "& .MuiListItemText-primary, & .MuiListItemIcon-root": {
                  color: `${color.action.destructive.default.value} !important`,
                },
              }}
            >
              <ListItemIcon><SignOutIcon size="md" /></ListItemIcon>
              <ListItemText>Leave group</ListItemText>
            </MenuItem>
          </Menu>
          {leaveOpen && (
            <LeaveDialog
              isOwner={activeConversation.ownerId === CURRENT_USER_ID}
              onCancel={() => setLeaveOpen(false)}
              onConfirm={() => {
                setLeaveOpen(false);
                setActiveConversation(null);
              }}
              onManageMembers={() => {
                setLeaveOpen(false);
                setGroupView("participants");
              }}
            />
          )}
        </>
      ) : showThreadView ? (
        <>
          <MessengerTitleBar onClose={closePanel} />
          {showThreadSubview ? (
            <ThreadView
              conversation={null}
              messages={threadMessages}
              onBack={closeThread}
              subheaderSlot={<ThreadSubheader onBack={closeThread} />}
              onSendMessage={sendThreadReply}
              reactionsByMessage={reactionsByMessage}
              onToggleReaction={toggleReaction}
              replyCounts={replyCounts}
              showTodayDivider={false}
              parentMessageId={threadParentId ?? undefined}
              threadSeparatorAfterId={threadReplies.length > 0 ? threadParentId ?? undefined : undefined}
              threadSeparatorCount={threadReplies.length > 0 ? threadReplies.length : undefined}
            />
          ) : (
          <ThreadView
            conversation={conversationToShow}
            messages={messagesToShow}
            reactionsByMessage={reactionsByMessage}
            onToggleReaction={toggleReaction}
            replyCounts={replyCounts}
            onOpenThread={composerOpen ? undefined : openThread}
            onSendMessage={composerOpen ? undefined : sendSelectedMessage}
            participants={composerOpen ? undefined : selectedConversationParticipants}
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
                ? (matchedGroup || singleRecipientWithThread
                    ? dismissComposerKeepConversation
                    : (composerRecipients.length > 0 ? activateNewConversation : undefined))
                : undefined
            }
            onComposerBarClick={
              composerOpen
                ? (matchedGroup || singleRecipientWithThread
                    ? dismissComposerKeepConversation
                    : (composerRecipients.length > 0 ? activateNewConversation : undefined))
                : undefined
            }
          />
          )}
        </>
      ) : (
        <>
          <MessengerTitleBar onClose={closePanel} />

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
              <ConversationItem key={conv.id} conversation={conv} onSelect={handleSelectConversation} />
            ))}
          </Box>
        </>
      )}
    </Drawer>
  );
}
