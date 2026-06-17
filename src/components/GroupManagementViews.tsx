import { useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowLeftIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowLeft";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import ProfileIcon from "@diligentcorp/atlas-react-bundle/icons/Profile";
import { type Person, CURRENT_USER_ID, PEOPLE } from "../data/people.js";

interface AvatarRingProps {
  person: Person;
  size?: number;
}

function PersonAvatar({ person, size = 32 }: AvatarRingProps) {
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
        fontSize: `${Math.round(size * 0.36)}px`,
      }}
    >
      {person.initials}
    </Avatar>
  );
}

interface ManagementHeaderProps {
  title: string;
  onBack: () => void;
}

function ManagementHeader({ title, onBack }: ManagementHeaderProps) {
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
      <IconButton sx={{ p: "4px", width: 32, height: 32 }} onClick={onBack} aria-label="Back">
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
        {title}
      </Typography>
    </Stack>
  );
}

interface ParticipantsViewProps {
  groupName: string;
  recipients: Person[];
  ownerId: string;
  onBack: () => void;
  onAddMember?: () => void;
}

export function ParticipantsView({ groupName, recipients, ownerId, onBack, onAddMember }: ParticipantsViewProps) {
  const { tokens: { semantic: { color } } } = useTheme();
  const sorted = [...recipients].sort((a, b) => {
    if (a.id === ownerId) return -1;
    if (b.id === ownerId) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--Gradient-background-default, radial-gradient(125.08% 101.36% at 0% 0%, var(--Semantic-Color-Background-Base-gradient-start, #F9F9FC) 30.53%, var(--Semantic-Color-Background-Base-gradient-end, #FCFCFF) 100%))",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap="8px"
        sx={{
          flexShrink: 0,
          height: 56,
          px: "12px",
          borderBottomLeftRadius: "12px",
          borderBottomRightRadius: "12px",
          boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.06)",
          backgroundColor: "#fff",
          position: "relative",
          zIndex: 1,
        }}
      >
        <IconButton color="tertiary" size="small" onClick={onBack} aria-label="Back">
          <ChevronLeftIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              color: color.type.default.value,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {groupName}
          </Typography>
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "18px",
              color: color.type.muted.value,
            }}
          >
            Participants
          </Typography>
        </Box>
        <IconButton color="tertiary" size="small" onClick={onAddMember} aria-label="Add member">
          <AddIcon />
        </IconButton>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {sorted.map((p) => {
          const isMe = p.id === CURRENT_USER_ID;
          const isOwner = p.id === ownerId;
          return (
            <Stack
              key={p.id}
              direction="row"
              alignItems="center"
              gap="12px"
              sx={{
                px: "16px",
                py: "8px",
                minHeight: 56,
                "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
              }}
            >
              <PersonAvatar person={p} size={32} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: color.type.default.value,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.name}{isMe ? " (You)" : ""}
                </Typography>
                {isOwner && (
                  <Typography sx={{ fontSize: "12px", color: color.type.muted.value, lineHeight: "18px" }}>
                    Owner
                  </Typography>
                )}
              </Box>
              {!isMe && (
                <IconButton color="tertiary" size="small" aria-label={`More actions for ${p.name}`}>
                  <MoreVertIcon />
                </IconButton>
              )}
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
}

interface GroupNameViewProps {
  initialName: string;
  onBack: () => void;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function GroupNameView({ initialName, onBack, onSave, onCancel }: GroupNameViewProps) {
  const { tokens: { semantic: { color } } } = useTheme();
  const [name, setName] = useState(initialName);
  const dirty = name.trim() !== initialName.trim();

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#fff" }}>
      <ManagementHeader title="Choose name" onBack={onBack} />

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: "16px", py: "16px" }}>
        <Stack direction="row" alignItems="baseline" gap="4px" sx={{ mb: "8px" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: color.type.default.value }}>
            Name
          </Typography>
          <Typography sx={{ fontSize: "12px", color: color.type.muted.value }}>
            (required)
          </Typography>
        </Stack>
        <Box
          component="input"
          autoFocus
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Add a name"
          sx={{
            width: "100%",
            height: 40,
            border: `1px solid ${color.outline.fixed.value}`,
            borderRadius: "8px",
            background: "transparent",
            fontFamily: "inherit",
            fontSize: "14px",
            color: color.type.default.value,
            px: "12px",
            outline: "none",
            "&::placeholder": { color: color.type.muted.value, opacity: 1 },
            "&:focus": {
              borderColor: color.outline.default.value,
              boxShadow: `0 0 0 1px ${color.outline.default.value}`,
            },
          }}
        />
      </Box>

      <Stack
        direction="row"
        justifyContent="flex-end"
        gap="8px"
        sx={{
          flexShrink: 0,
          px: "16px",
          py: "12px",
          borderTop: `1px solid ${color.ui.divider.default.value}`,
        }}
      >
        <Button variant="text" onClick={onCancel} sx={{ minWidth: 72 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave(name.trim())}
          disabled={!dirty || !name.trim()}
          sx={{ minWidth: 72 }}
        >
          Save
        </Button>
      </Stack>
    </Box>
  );
}

interface AddMemberViewProps {
  existingIds: string[];
  onBack: () => void;
  onCancel: () => void;
  onAdd: (people: Person[], shareHistory: boolean) => void;
}

export function AddMemberView({ existingIds, onBack, onCancel, onAdd }: AddMemberViewProps) {
  const { tokens: { semantic: { color } } } = useTheme();
  const [picked, setPicked] = useState<Person[]>([]);
  const [query, setQuery] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const taken = useMemo(() => new Set([...existingIds, ...picked.map((p) => p.id)]), [existingIds, picked]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = PEOPLE.filter((p) => !taken.has(p.id));
    const filtered = q ? pool.filter((p) => p.name.toLowerCase().includes(q)) : pool;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [query, taken]);

  const addPerson = (p: Person) => {
    setPicked((ps) => [...ps, p]);
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--Gradient-background-default, radial-gradient(125.08% 101.36% at 0% 0%, var(--Semantic-Color-Background-Base-gradient-start, #F9F9FC) 30.53%, var(--Semantic-Color-Background-Base-gradient-end, #FCFCFF) 100%))" }}>
      {/* Header card: title row + chip-input row */}
      <Box
        sx={{
          flexShrink: 0,
          backgroundColor: "#fff",
          borderBottomLeftRadius: "12px",
          borderBottomRightRadius: "12px",
          boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.06)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Title row */}
        <Stack
          direction="row"
          alignItems="center"
          gap="8px"
          sx={{ height: 56, px: "12px" }}
        >
          <IconButton color="tertiary" size="small" onClick={onBack} aria-label="Back">
            <ChevronLeftIcon />
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
            Choose people
          </Typography>
        </Stack>

        {/* Chip-input row — same shape as the recipient row in GroupComposer */}
        <Stack
          direction="row"
          alignItems="center"
          gap="4px"
          sx={{
            px: "12px",
            pb: "8px",
            minHeight: 36,
          }}
          onClick={() => inputRef.current?.focus()}
        >
          <Box sx={{ display: "flex", alignItems: "center", color: color.action.primary.default.value, flexShrink: 0 }}>
            <ProfileIcon size="md" />
          </Box>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px", minWidth: 0, px: "8px", minHeight: 28 }}>
            {picked.map((r) => (
              <Chip
                key={r.id}
                size="xsmall"
                label={r.name}
                avatar={<Avatar><PersonAvatar person={r} size={24} /></Avatar>}
                onDelete={() => setPicked((ps) => ps.filter((x) => x.id !== r.id))}
                sx={{
                  height: 28,
                  borderRadius: "9999px",
                  backgroundColor: "#F9F9FC",
                  border: "none",
                  color: color.type.default.value,
                  "& .MuiChip-label": { fontSize: "14px", px: "8px" },
                  "& .MuiChip-avatar": {
                    backgroundColor: "transparent",
                    width: 24,
                    height: 24,
                    marginLeft: "4px",
                    marginRight: 0,
                  },
                  "& .MuiChip-deleteIcon": { color: color.type.default.value, marginRight: "6px" },
                  "&:hover": { backgroundColor: color.action.secondary.hover.value },
                }}
              />
            ))}
            <Box
              component="input"
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Backspace" && query === "" && picked.length > 0) {
                  e.preventDefault();
                  setPicked((ps) => ps.slice(0, -1));
                }
              }}
              placeholder=""
              sx={{
                flex: "1 1 0",
                minWidth: 0,
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: "inherit",
                fontSize: "14px",
                color: color.type.default.value,
                padding: 0,
                height: 28,
              }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Suggested list */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <Typography
          sx={{
            px: "16px",
            pt: "12px",
            pb: "4px",
            fontSize: "12px",
            fontWeight: 400,
            color: color.type.muted.value,
            lineHeight: "16px",
          }}
        >
          Suggested
        </Typography>
        {suggestions.map((p) => (
          <ListItemButton
            key={p.id}
            onClick={() => addPerson(p)}
            sx={{
              px: "12px",
              py: "8px",
              gap: "12px",
              "&:hover": { backgroundColor: color.action.secondary.hoverFill.value },
            }}
          >
            <ListItemAvatar sx={{ minWidth: 0, mr: 0 }}>
              <PersonAvatar person={p} size={32} />
            </ListItemAvatar>
            <ListItemText
              primary={p.name}
              primaryTypographyProps={{
                sx: {
                  fontSize: "16px",
                  fontWeight: 400,
                  lineHeight: "24px",
                  color: color.type.default.value,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
              sx={{ m: 0 }}
            />
          </ListItemButton>
        ))}
      </Box>

      {/* Footer */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        gap="8px"
        sx={{
          flexShrink: 0,
          px: "16px",
          py: "12px",
          borderTop: `1px solid ${color.ui.divider.default.value}`,
        }}
      >
        <Button variant="text" onClick={onCancel} sx={{ minWidth: 72 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => setShareDialogOpen(true)}
          disabled={picked.length === 0}
          sx={{ minWidth: 72 }}
        >
          Add
        </Button>
      </Stack>

      <ShareHistoryDialog
        open={shareDialogOpen}
        onCancel={() => setShareDialogOpen(false)}
        onConfirm={(shareHistory) => {
          setShareDialogOpen(false);
          onAdd(picked, shareHistory);
        }}
      />
    </Box>
  );
}

interface ShareHistoryDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (shareHistory: boolean) => void;
}

export function ShareHistoryDialog({ open, onCancel, onConfirm }: ShareHistoryDialogProps) {
  const { tokens: { semantic: { color } } } = useTheme();
  const [shareHistory, setShareHistory] = useState(false);

  if (!open) return null;

  return (
    <Box
      onClick={onCancel}
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        backgroundColor: "rgba(0, 0, 0, 0.32)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: "20px",
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: color.surface.default.value,
          borderRadius: "12px",
          boxShadow: "0px 0px 2px 0px rgba(22,27,43,0.10), 0px 10px 24px 0px rgba(22,27,43,0.16)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack direction="row" alignItems="flex-start" gap="8px" sx={{ pt: "24px", pb: "12px", px: "24px" }}>
          <Typography
            component="h2"
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: "18px !important",
              fontWeight: 600,
              lineHeight: "24px !important",
              letterSpacing: "0px",
              color: color.type.default.value,
              fontFamily: "var(--Semantic-Typography-Title-H4-Lg-Font, inherit)",
            }}
          >
            Sharing conversation history
          </Typography>
          <IconButton color="tertiary" size="small" onClick={onCancel} aria-label="Close">
            <CloseIcon size="md" />
          </IconButton>
        </Stack>
        <Box sx={{ px: "24px", pb: "24px" }}>
          <Typography
            sx={{
              fontSize: "14px !important",
              fontWeight: 400,
              lineHeight: "20px !important",
              letterSpacing: "0.2px",
              color: "#595959",
              mb: "24px",
              fontFamily: "var(--Semantic-Typography-Text-Md-Font, inherit)",
            }}
          >
            You are about to add new member(s) to this group, do you want to share the whole message history with them?
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={shareHistory}
                onChange={(e) => setShareHistory(e.target.checked)}
                sx={{ p: 0, m: 0 }}
              />
            }
            label={
              <Typography
                sx={{
                  fontSize: "14px !important",
                  fontWeight: 400,
                  lineHeight: "20px !important",
                  letterSpacing: "0.2px",
                  color: color.type.default.value,
                  fontFamily: "var(--Semantic-Typography-Text-Md-Font, inherit)",
                }}
              >
                Share group message history
              </Typography>
            }
            sx={{
              ml: 0,
              gap: "8px",
              alignItems: "center",
              "& .MuiFormControlLabel-label": { ml: 0 },
            }}
          />
        </Box>
        <Stack
          direction="row"
          justifyContent="flex-end"
          gap="8px"
          sx={{ px: "16px", py: "12px", borderTop: `1px solid ${color.ui.divider.default.value}` }}
        >
          <Button variant="text" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => onConfirm(shareHistory)}>
            Add
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

interface LeaveDialogProps {
  isOwner: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onManageMembers: () => void;
}

export function LeaveDialog({ isOwner, onCancel, onConfirm, onManageMembers }: LeaveDialogProps) {
  const { tokens: { semantic: { color } } } = useTheme();
  return (
    <Box
      onClick={onCancel}
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        backgroundColor: "rgba(0, 0, 0, 0.32)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: "20px",
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: color.surface.default.value,
          borderRadius: "12px",
          boxShadow: "0px 0px 2px 0px rgba(22,27,43,0.10), 0px 10px 24px 0px rgba(22,27,43,0.16)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack direction="row" alignItems="flex-start" gap="8px" sx={{ pt: "24px", pb: "12px", px: "24px" }}>
          <Typography
            component="h2"
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: "18px !important",
              fontWeight: 600,
              lineHeight: "24px !important",
              letterSpacing: "0.2px",
              color: color.type.default.value,
              fontFamily: "var(--Semantic-Typography-Title-H4-Lg-Font, inherit)",
            }}
          >
            Before you leave
          </Typography>
          <IconButton color="tertiary" size="small" onClick={onCancel} aria-label="Close">
            <CloseIcon size="md" />
          </IconButton>
        </Stack>
        <Box sx={{ px: "24px", pb: "24px" }}>
          <Typography
            sx={{
              fontSize: "14px !important",
              fontWeight: 400,
              lineHeight: "20px !important",
              letterSpacing: "0.2px",
              color: "#464E53",
              fontFamily: "var(--Semantic-Typography-Text-Md-Font, inherit)",
            }}
          >
            {isOwner
              ? "You're the owner in this group. Please assign admin rights to someone else member before leaving."
              : "Are you sure you want to leave this group? You'll lose access to its message history."}
          </Typography>
        </Box>
        <Stack
          direction="row"
          justifyContent="flex-end"
          gap="8px"
          sx={{ px: "16px", py: "12px", borderTop: `1px solid #DEE0E9` }}
        >
          <Button variant="text" onClick={onCancel}>
            Cancel
          </Button>
          {isOwner ? (
            <Button variant="contained" onClick={onManageMembers}>
              Manage members
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={onConfirm}
              sx={{
                backgroundColor: color.action.destructive.default.value,
                "&:hover": { backgroundColor: color.action.destructive.hover.value },
              }}
            >
              Leave
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
