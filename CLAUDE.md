# Smart Assist

## What this is

Smart Assist is a board governance platform prototype built for Diligent that provides directors and administrators with AI-powered document search and insights across board materials. The system includes a director-facing reader interface for browsing board books and documents, an admin interface for managing content, and an AI assistant that can answer questions about documents with citations and source tracking. It's designed to help board members quickly find and understand critical governance information.

## Key pages and components

**Pages:**
- `DirectorHomePage` — Director dashboard/landing
- `DirectorBooksPage` — List of board books available to directors
- `DirectorBookReaderPage` — Document viewer with page navigation
- `DirectorResourceCenterPage` — Resource library for directors
- `AdminBooksPage` — Admin interface for managing books
- `BookEditorPage` — Editor for creating/updating board books
- `AIAssistantPage` — Dedicated AI chat interface
- `ResourceCenterPage` — Admin resource management
- `SettingsPage` — User settings and preferences

**Key components:**
- `SmartAssistWidget` / `SmartAssistSidenav` — Floating/sidebar AI chat interface
- `CitationPreviewPanel` — Shows sources and citations for AI responses
- `DocumentViewerToolbar` — Controls for document navigation
- `PersonalizationDialog` — User preference settings
- `RichAIMessageContent` — Renders formatted AI responses with sources

## Tech stack

- **Framework:** React 18 + TypeScript, Vite
- **Routing:** React Router
- **UI:** Material-UI (MUI), Diligent Atlas React Bundle
- **Styling:** CSS + MUI theme tokens
- **Context:** React Context for SmartAssist and CitationPreview state
- **Deployment:** Netlify

## Current state

The prototype has working navigation, page layouts, and UI components for document viewing and AI chat. Mock data and document page images are in place. The AI assistant backend integration and real search/citation logic appear to be stubbed or incomplete based on the component structure.