# Smart Assist

## What this is

Smart Assist is a board governance platform prototype built for Diligent that provides directors and administrators with AI-powered document search and insights across board materials. Directors can browse and read board books, access a resource center, and interact with an AI assistant that answers questions about documents with citations. Administrators can manage and edit board books. The prototype includes mock data for financial reports, meeting minutes, strategic plans, and other corporate governance documents.

## Key pages and components

**Pages:**
- `DirectorHomePage` — Director dashboard/landing
- `DirectorBooksPage` — List of board books for directors
- `DirectorBookReaderPage` — Document viewer for board books
- `DirectorResourceCenterPage` — Resource library for directors
- `AdminBooksPage` — Admin view of all books
- `BookEditorPage` — Admin interface to edit books
- `AIAssistantPage` — Dedicated AI chat interface
- `SettingsPage` — User settings
- `ResourceCenterPage` — Admin resource center

**Key components:**
- `SmartAssistWidget` / `SmartAssistSidenav` — AI chat sidebar
- `DocumentViewerToolbar` — Controls for viewing documents
- `CitationPreviewPanel` — Shows sources for AI responses
- `RichAIMessageContent` — Renders AI messages with formatting
- `PersonalizationDialog` — User preference settings
- `SourcesBlock` / `SourcesFilterButton` — Citation filtering

## Tech stack

- **Framework:** React 18 + TypeScript, Vite
- **Routing:** React Router
- **UI:** Material-UI (MUI), Diligent Atlas React Bundle
- **Styling:** CSS + MUI theme tokens
- **Context:** React Context for SmartAssist and CitationPreview state
- **Deployment:** Netlify

## Current state

The prototype has a working navigation structure, page layouts, and UI components for browsing documents and interacting with an AI assistant. Mock data and document page images are in place. The AI assistant logic, backend integration, and real search/citation functionality appear to be placeholder or incomplete based on the component structure.