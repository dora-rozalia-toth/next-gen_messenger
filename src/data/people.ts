export type AvatarColor = "blue" | "yellow" | "green" | "red" | "purple";

export interface Person {
  id: string;
  name: string;
  initials: string;
  email: string;
  avatarColor: AvatarColor;
  phone?: string;
  company?: string;
}

export const PEOPLE: Person[] = [
  { id: "p1", name: "Alice Martin", initials: "AM", email: "alice.martin@example.com", avatarColor: "blue", phone: "+56 23 46 782", company: "Coca-Cola Inc." },
  { id: "p2", name: "Bob Taylor", initials: "BT", email: "bob.taylor@example.com", avatarColor: "red", phone: "+1 415 555 0132", company: "Northwind Traders" },
  { id: "p3", name: "Charlie Miller", initials: "CM", email: "charlie.miller@example.com", avatarColor: "purple", phone: "+44 20 7946 0958", company: "Globex Corporation" },
  { id: "p4", name: "Elisa Smith", initials: "ES", email: "elisa.smith@example.com", avatarColor: "yellow", phone: "+1 202 555 0174", company: "Initech" },
  { id: "p5", name: "John Doe", initials: "JD", email: "john.doe@example.com", avatarColor: "blue", phone: "+1 312 555 0188", company: "Diligent Corp." },
  { id: "p6", name: "Laura Thompson", initials: "LT", email: "laura.thompson@example.com", avatarColor: "green", phone: "+61 2 5550 1234", company: "Soylent Corp" },
  { id: "p7", name: "Jane Joane", initials: "JJ", email: "jane.joane@example.com", avatarColor: "purple", phone: "+33 1 70 18 99 00", company: "Hooli" },
  { id: "p8", name: "John Martin", initials: "JM", email: "john.martin@example.com", avatarColor: "red", phone: "+49 30 901820", company: "Umbrella LLC" },
  { id: "p9", name: "Jolanda Taylor", initials: "JT", email: "jolanda.taylor@example.com", avatarColor: "yellow", phone: "+31 20 794 0100", company: "Vehement Capital" },
  { id: "p10", name: "Jolyn Miller", initials: "JM", email: "jolyn.miller@example.com", avatarColor: "blue", phone: "+1 646 555 0156", company: "Massive Dynamic" },
  { id: "p11", name: "Jason Thompson", initials: "JT", email: "jason.thompson@example.com", avatarColor: "green", phone: "+1 503 555 0119", company: "Stark Industries" },
  { id: "p12", name: "Terry Snow", initials: "TS", email: "terry.snow@example.com", avatarColor: "red", phone: "+1 718 555 0143", company: "Wayne Enterprises" },
  { id: "p13", name: "Nora Klein", initials: "NK", email: "nora.klein@example.com", avatarColor: "purple", phone: "+43 1 2675 0000", company: "Acme Corp." },
];

// Contacts the current user has never messaged. Selecting one as the sole
// recipient in the composer shows the empty conversation preview instead of a
// fabricated 1-on-1 thread. Used to exercise the "new message" empty state.
export const PEOPLE_WITHOUT_CONVERSATION = new Set<string>(["p13"]);

export function personHasExistingConversation(id: string): boolean {
  return !PEOPLE_WITHOUT_CONVERSATION.has(id);
}

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
