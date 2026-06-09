import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import ProfileIcon from "@diligentcorp/atlas-react-bundle/icons/Profile";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import { type ExistingGroup, type Person, PEOPLE, findGroupsByParticipants } from "../data/people.js";

const RECIPIENT_ROW_MAX_HEIGHT = 80;

interface Props {
  onClose: () => void;
  onMatchedGroupChange: (group: ExistingGroup | null) => void;
  onRecipientsChange?: (recipients: Person[], groupName: string) => void;
  initialRecipients?: Person[];
  initialGroupName?: string;
}

type Option = Person & { label: string };

const optionsFromPeople: Option[] = PEOPLE.map((p) => ({ ...p, label: p.name }));

function PersonAvatar({ person, size = 24 }: { person: Person; size?: number }) {
  const { presets: { AvatarPresets } } = useTheme();
  const avatarProps = AvatarPresets.getAvatarProps({ size: "small", color: person.avatarColor });
  const yellowOverride = person.avatarColor === "yellow"
    ? { backgroundColor: "var(--Semantic-Color-Accent-Yellow-Background, #FFF2AA)" }
    : {};
  return (
    <Avatar
      {...avatarProps}
      sx={{
        ...avatarProps.sx,
        ...yellowOverride,
        width: size,
        height: size,
        fontSize: `${Math.round(size * 0.42)}px`,
      }}
    >
      {person.initials}
    </Avatar>
  );
}

function renderHighlighted(name: string, query: string) {
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

export default function GroupComposer({ onClose, onMatchedGroupChange, onRecipientsChange, initialRecipients, initialGroupName }: Props) {
  const { tokens: { semantic: { color } } } = useTheme();
  const [recipients, setRecipients] = useState<Option[]>(
    () => (initialRecipients ?? []).map((p) => ({ ...p, label: p.name })),
  );
  const [recipientQuery, setRecipientQuery] = useState("");
  const recipientInputRef = useRef<HTMLInputElement>(null);
  const [recipientFocused, setRecipientFocused] = useState(false);
  const [groupName, setGroupName] = useState(initialGroupName ?? "");
  const [forceNewGroup, setForceNewGroup] = useState(false);
  const [groupsExpanded, setGroupsExpanded] = useState(false);
  const [pickedGroupId, setPickedGroupId] = useState<string | null>(null);

  useEffect(() => {
    onRecipientsChange?.(recipients.map(({ label: _l, ...p }) => p), groupName);
  }, [recipients, groupName, onRecipientsChange]);

  const suggestions = useMemo(() => {
    const q = recipientQuery.trim().toLowerCase();
    const taken = new Set(recipients.map((r) => r.id));
    const pool = optionsFromPeople.filter((p) => !taken.has(p.id));
    const filtered = q ? pool.filter((p) => p.name.toLowerCase().includes(q)) : pool;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [recipientQuery, recipients]);

  const showDropdown = recipientFocused && suggestions.length > 0;

  const matchedGroups = useMemo(() => {
    if (forceNewGroup) return [];
    return findGroupsByParticipants(recipients.map((r) => r.id));
  }, [recipients, forceNewGroup]);

  useEffect(() => {
    if (matchedGroups.length === 0) {
      setPickedGroupId(null);
      onMatchedGroupChange(null);
      return;
    }
    const stillValid = pickedGroupId && matchedGroups.find((g) => g.id === pickedGroupId);
    const next = stillValid ?? matchedGroups[0];
    if (next.id !== pickedGroupId) setPickedGroupId(next.id);
    onMatchedGroupChange(next);
  }, [matchedGroups, pickedGroupId, onMatchedGroupChange]);

  const showMatches = matchedGroups.length > 0 && !forceNewGroup;

  // Flat-row spec from design: width 440px, padding 0 12px, gap 4px, no border.
  const flatRowSx = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    px: "12px",
    minHeight: 36,
  } as const;

  // Wrapper styling shared by recipient and group-name rows: hover paints a
  // pill (#f3f3f3, radius 8) over the input area only; focus is transparent.
  const inputWrapperSx = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "text",
    borderRadius: "8px",
    px: "8px",
    minHeight: 28,
    transition: "background-color 120ms ease",
    "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
    "&:focus-within": { backgroundColor: "transparent" },
  } as const;

  const rawInputSx = {
    flex: "1 1 auto",
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
    fontFamily: "inherit",
    color: color.type.default.value,
    padding: 0,
    height: 28,
    "&::placeholder": { color: color.type.muted.value, opacity: 1 },
  } as const;

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        flexShrink: 0,
        backgroundColor: color.surface.default.value,
        borderBottom: `1px solid ${color.ui.divider.default.value}`,
        position: "relative",
        zIndex: 2,
        py: "8px",
      }}
    >
      {/* Title row */}
      <Stack direction="row" alignItems="center" sx={{ px: "12px", height: 32, mb: "4px" }}>
        <Typography sx={{ flex: 1, fontWeight: 600, fontSize: "14px", color: color.type.default.value }}>
          New message
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close composer" sx={{ width: 28, height: 28 }}>
          <CloseIcon size="md" />
        </IconButton>
      </Stack>

      {/* Recipient row — flat, 440px, padding 0 12px, gap 4px, vertically centered */}
      <Box sx={{ position: "relative" }}>
        <Box sx={{ ...flatRowSx, maxHeight: RECIPIENT_ROW_MAX_HEIGHT, overflowY: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", color: color.action.primary.default.value, flexShrink: 0 }}>
            <ProfileIcon size="md" />
          </Box>
          <Box
            onClick={() => recipientInputRef.current?.focus()}
            sx={{ ...inputWrapperSx, flexWrap: "wrap" }}
          >
            {recipients.map((r) => (
              <Chip
                key={r.id}
                size="xsmall"
                label={r.name}
                avatar={<Avatar><PersonAvatar person={r} size={24} /></Avatar>}
                onDelete={() => {
                  setRecipients((rs) => rs.filter((x) => x.id !== r.id));
                  setForceNewGroup(false);
                }}
                sx={{
                  height: 28,
                  borderRadius: "9999px",
                  // Figma: Semantic/Color/Surface/Variant subtle
                  backgroundColor: "#F9F9FC",
                  border: "none",
                  color: color.type.default.value,
                  "& .MuiChip-label": {
                    fontSize: "14px",
                    px: "8px",
                  },
                  "& .MuiChip-avatar": {
                    backgroundColor: "transparent",
                    width: 24,
                    height: 24,
                    marginLeft: "4px",
                    marginRight: 0,
                  },
                  "& .MuiChip-deleteIcon": {
                    color: color.type.default.value,
                    marginRight: "6px",
                  },
                  "&:hover": { backgroundColor: color.action.secondary.hover.value },
                }}
              />
            ))}
            <Box
              component="input"
              ref={recipientInputRef}
              value={recipientQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientQuery(e.target.value)}
              onFocus={() => setRecipientFocused(true)}
              onBlur={() => setRecipientFocused(false)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if ((e.key === "Enter" || e.key === ",") && recipientQuery.trim()) {
                  e.preventDefault();
                  const q = recipientQuery.trim().toLowerCase();
                  const match = optionsFromPeople.find(
                    (p) => !recipients.some((r) => r.id === p.id) &&
                      (p.name.toLowerCase() === q || p.email.toLowerCase() === q || p.name.toLowerCase().startsWith(q)),
                  );
                  const next: Option = match ?? {
                    id: `freetext-${Date.now()}`,
                    name: recipientQuery.trim(),
                    initials: recipientQuery.trim().slice(0, 2).toUpperCase(),
                    email: recipientQuery.trim(),
                    avatarColor: "blue",
                    label: recipientQuery.trim(),
                  };
                  setRecipients((rs) => [...rs, next]);
                  setRecipientQuery("");
                  setForceNewGroup(false);
                } else if (e.key === "Backspace" && recipientQuery === "" && recipients.length > 0) {
                  e.preventDefault();
                  setRecipients((rs) => rs.slice(0, -1));
                  setForceNewGroup(false);
                }
              }}
              placeholder={recipients.length === 0 ? "Enter a name, or e-mail" : ""}
              sx={{ ...rawInputSx, flex: "1 1 120px", minWidth: 80 }}
            />
          </Box>
        </Box>
        {showDropdown && (
          <Box
            sx={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: "12px",
              right: "12px",
              zIndex: 5,
              maxHeight: 240,
              overflowY: "auto",
              backgroundColor: color.surface.default.value,
              border: `1px solid ${color.outline.fixed.value}`,
              borderRadius: "8px",
              boxShadow: "0px 4px 12px 0px rgba(0, 0, 0, 0.08)",
              py: "4px",
            }}
          >
            {suggestions.map((p) => (
              <Box
                key={p.id}
                role="option"
                onMouseDown={(e: React.MouseEvent) => {
                  // mousedown so we add before the input blurs
                  e.preventDefault();
                  setRecipients((rs) => [...rs, p]);
                  setRecipientQuery("");
                  setForceNewGroup(false);
                  recipientInputRef.current?.focus();
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  height: 32,
                  px: "8px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  mx: "4px",
                  "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
                }}
              >
                <PersonAvatar person={p} size={24} />
                <Typography sx={{ fontSize: "14px", color: color.type.default.value }}>
                  {renderHighlighted(p.name, recipientQuery)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Group name OR matched-groups chip selector — same flat 440px row */}
      <Box sx={{ ...flatRowSx, mt: "4px", alignItems: "flex-start" }}>
        {!showMatches && (
          <Box sx={{ display: "flex", alignItems: "center", color: color.action.primary.default.value, flexShrink: 0 }}>
            <EditIcon size="md" />
          </Box>
        )}
        {showMatches ? (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <MatchedGroupsRow
              groups={matchedGroups}
              pickedId={pickedGroupId}
              expanded={groupsExpanded}
              onToggleExpanded={() => setGroupsExpanded(true)}
              onPick={(id) => {
                setPickedGroupId(id);
                const g = matchedGroups.find((m) => m.id === id);
                if (g) onMatchedGroupChange(g);
              }}
              onStartNew={() => {
                setForceNewGroup(true);
                setGroupsExpanded(false);
              }}
            />
          </Box>
        ) : (
          <Box sx={inputWrapperSx}>
            <Box
              component="input"
              value={groupName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
              placeholder="Add a name"
              sx={rawInputSx}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface MatchedGroupsRowProps {
  groups: ExistingGroup[];
  pickedId: string | null;
  expanded: boolean;
  onToggleExpanded: () => void;
  onPick: (id: string) => void;
  onStartNew: () => void;
}

function MatchedGroupsRow({
  groups,
  pickedId,
  expanded,
  onToggleExpanded,
  onPick,
  onStartNew,
}: MatchedGroupsRowProps) {
  const { tokens: { semantic: { color } } } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(groups.length);

  useEffect(() => {
    if (expanded) {
      setVisibleCount(groups.length);
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const containerWidth = container.offsetWidth;
      const children = Array.from(container.querySelectorAll<HTMLElement>("[data-chip]"));
      const gap = 4;
      // First pass: do all chips fit without an overflow chip?
      let totalWidth = 0;
      children.forEach((c, i) => {
        totalWidth += c.offsetWidth + (i > 0 ? gap : 0);
      });
      if (totalWidth <= containerWidth) {
        setVisibleCount(children.length);
        return;
      }
      // Otherwise reserve space for a "+N more" chip and pack what fits.
      const overflowChipReserve = 64;
      const available = Math.max(0, containerWidth - overflowChipReserve);
      let used = 0;
      let count = 0;
      for (const child of children) {
        const w = child.offsetWidth + (count > 0 ? gap : 0);
        if (used + w > available) break;
        used += w;
        count++;
      }
      setVisibleCount(Math.max(1, count));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [groups, expanded]);

  const overflow = groups.length - visibleCount;
  const shown = expanded ? groups : groups.slice(0, visibleCount);

  // Atlas chip_new spec from Figma: 28px tall pill, 11px label-xs text, 4px outer
  // padding around an inner row that has 4px horizontal padding around the label.
  // Selected chip is filled with selection.primary.default (dark), default text color
  // is selection.primary.onSelected (white).
  const chipBaseSx = {
    height: 28,
    maxWidth: "none",
    flexShrink: 0,
    borderRadius: "9999px",
    border: "none",
    fontSize: "11px",
    lineHeight: "16px",
    letterSpacing: "0.4px",
    "& .MuiChip-label": {
      px: "8px",
      fontSize: "11px",
      lineHeight: "16px",
      letterSpacing: "0.4px",
      overflow: "visible",
      textOverflow: "clip",
    },
  } as const;

  const chipUnselectedSx = {
    ...chipBaseSx,
    backgroundColor: "#fafafa",
    color: color.type.default.value,
    "&:hover": { backgroundColor: color.surface.variant.value },
  } as const;

  const chipSelectedSx = {
    ...chipBaseSx,
    backgroundColor: color.selection.primary.default.value,
    color: color.selection.primary.onSelected.value,
    "&:hover": { backgroundColor: color.selection.primary.hover.value },
  } as const;

  return (
    <Box>
      <Typography sx={{ fontSize: "12px", fontWeight: 600, lineHeight: "16px", letterSpacing: "0.3px", color: color.type.default.value, mb: "8px" }}>
        Suggestions
      </Typography>
      <Stack direction="row" alignItems="center" gap="4px">
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            display: "flex",
            flexWrap: expanded ? "wrap" : "nowrap",
            gap: "4px",
            maxHeight: expanded ? 64 : 32,
            overflowY: expanded ? "auto" : "hidden",
            overflowX: "hidden",
            alignItems: "center",
          }}
        >
          {shown.map((g) => {
            const picked = g.id === pickedId;
            return (
              <Chip
                key={g.id}
                data-chip
                size="xsmall"
                clickable
                label={g.name}
                onClick={() => onPick(g.id)}
                sx={picked ? chipSelectedSx : chipUnselectedSx}
              />
            );
          })}
          {!expanded && overflow > 0 && (
            <Chip
              data-chip
              size="xsmall"
              clickable
              label={`+${overflow} more`}
              onClick={onToggleExpanded}
              sx={{
                ...chipUnselectedSx,
                color: color.type.muted.value,
              }}
            />
          )}
        </Box>
        <IconButton
          size="small"
          onClick={onStartNew}
          aria-label="Start a new group with these recipients"
          sx={{
            width: 32,
            height: 32,
            borderRadius: "9999px",
            flexShrink: 0,
            color: color.type.default.value,
            padding: 0,
            "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
          }}
        >
          <AddIcon size="md" />
        </IconButton>
      </Stack>
    </Box>
  );
}
