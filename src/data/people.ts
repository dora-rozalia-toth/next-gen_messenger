export type AvatarColor = "blue" | "yellow" | "green" | "red" | "purple";

export interface Person {
  id: string;
  name: string;
  initials: string;
  email: string;
  avatarColor: AvatarColor;
}

export const PEOPLE: Person[] = [
  { id: "p1", name: "Alice Martin", initials: "AM", email: "alice.martin@example.com", avatarColor: "blue" },
  { id: "p2", name: "Bob Taylor", initials: "BT", email: "bob.taylor@example.com", avatarColor: "red" },
  { id: "p3", name: "Charlie Miller", initials: "CM", email: "charlie.miller@example.com", avatarColor: "purple" },
  { id: "p4", name: "Elisa Smith", initials: "ES", email: "elisa.smith@example.com", avatarColor: "yellow" },
  { id: "p5", name: "John Doe", initials: "JD", email: "john.doe@example.com", avatarColor: "blue" },
  { id: "p6", name: "Laura Thompson", initials: "LT", email: "laura.thompson@example.com", avatarColor: "green" },
  { id: "p7", name: "Jane Joane", initials: "JJ", email: "jane.joane@example.com", avatarColor: "purple" },
  { id: "p8", name: "John Martin", initials: "JM", email: "john.martin@example.com", avatarColor: "red" },
  { id: "p9", name: "Jolanda Taylor", initials: "JT", email: "jolanda.taylor@example.com", avatarColor: "yellow" },
  { id: "p10", name: "Jolyn Miller", initials: "JM", email: "jolyn.miller@example.com", avatarColor: "blue" },
  { id: "p11", name: "Jason Thompson", initials: "JT", email: "jason.thompson@example.com", avatarColor: "green" },
  { id: "p12", name: "Terry Snow", initials: "TS", email: "terry.snow@example.com", avatarColor: "red" },
];

export interface ExistingGroup {
  id: string;
  name: string;
  participantIds: string[];
  ownerId: string;
  lastActivity: number;
}

export const CURRENT_USER_ID = "p5";

export const EXISTING_GROUPS: ExistingGroup[] = [
  {
    id: "g1",
    name: "Finance Q4",
    participantIds: ["p1", "p4", "p5", "p6", "p2"],
    ownerId: "p5",
    lastActivity: 3,
  },
  {
    id: "g2",
    name: "Q3 planning",
    participantIds: ["p1", "p4", "p5", "p6", "p2"],
    ownerId: "p5",
    lastActivity: 2,
  },
  {
    id: "g3",
    name: "Project Lumen",
    participantIds: ["p1", "p4", "p5", "p6", "p2"],
    ownerId: "p5",
    lastActivity: 1,
  },
  {
    id: "g4",
    name: "Customer feedback",
    participantIds: ["p1", "p4", "p5", "p6", "p2"],
    ownerId: "p5",
    lastActivity: 0,
  },
  {
    id: "g5",
    name: "Sales sync",
    participantIds: ["p1", "p4", "p5", "p6", "p2"],
    ownerId: "p5",
    lastActivity: -1,
  },
  {
    id: "g6",
    name: "Market research",
    participantIds: ["p1", "p2"],
    ownerId: "p5",
    lastActivity: -2,
  },
  {
    id: "g7",
    name: "Product launch",
    participantIds: ["p1", "p2", "p3"],
    ownerId: "p5",
    lastActivity: -3,
  },
  {
    id: "g8",
    name: "Risk assessment",
    participantIds: ["p1", "p2", "p7"],
    ownerId: "p5",
    lastActivity: -4,
  },
  {
    id: "g9",
    name: "Competitor analysis",
    participantIds: ["p1", "p2", "p8", "p9"],
    ownerId: "p5",
    lastActivity: -5,
  },
  {
    id: "g10",
    name: "Hiring panel",
    participantIds: ["p1", "p2", "p10"],
    ownerId: "p5",
    lastActivity: -6,
  },
  {
    id: "g11",
    name: "Board prep",
    participantIds: ["p1", "p2", "p11", "p12"],
    ownerId: "p5",
    lastActivity: -7,
  },
  {
    id: "g12",
    name: "Annual report",
    participantIds: ["p1", "p2", "p3", "p4"],
    ownerId: "p5",
    lastActivity: -8,
  },
  {
    id: "g13",
    name: "Strategy offsite",
    participantIds: ["p1", "p2", "p5", "p7"],
    ownerId: "p5",
    lastActivity: -9,
  },
];

export function findGroupsByParticipants(ids: string[]): ExistingGroup[] {
  // Match only when exactly two recipients are selected: return groups that
  // contain both of them. 1 recipient → no matches (1-on-1 instead);
  // 3+ recipients → no matches (empty new group).
  if (ids.length !== 2) return [];
  return EXISTING_GROUPS
    .filter((g) => ids.every((id) => g.participantIds.includes(id)))
    .sort((a, b) => b.lastActivity - a.lastActivity);
}
