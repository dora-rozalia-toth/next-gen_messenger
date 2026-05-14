# Smart Assist

## What this is

Smart Assist is a board governance platform prototype built for Diligent that provides directors and administrators with AI-assisted access to board materials, documents, and meeting resources. The application includes an AI assistant that can answer questions about documents, a document viewer with citation tracking, and separate interfaces for board administrators (managing books and materials) and directors (consuming board content and insights).

## Key pages and components

**Pages:**
- `DirectorHomePage` — Director dashboard/home view
- `DirectorBooksPage` — Director's list of board books
- `DirectorBookReaderPage` — Document viewer for board materials
- `DirectorResourceCenterPage` — Resource library for directors
- `AdminBooksPage` — Admin interface for managing board books
- `BookEditorPage` — Editor for creating/modifying board books
- `AIAssistantPage` — Dedicated AI chat interface
- `ResourceCenterPage` — Admin resource management
- `SettingsPage` — User settings and configuration

**Key components:**
- `SmartAssistWidget` / `SmartAssistSidenav` — AI chat interface (sidebar and overlay modes)
- `CitationPreviewPanel` — Shows document sources for AI responses
- `DocumentViewerToolbar` — Controls for document viewing
- `PersonalizationDialog` — User preference settings
- `RichAIMessageContent` — Formatted AI responses with citations
- `SourcesBlock` / `SourcesFilterButton` — Citation and source filtering

## Tech stack

- **Framework:** React 18 + TypeScript, Vite
- **Routing:** React Router
- **UI:** Material-UI (MUI), Diligent Atlas React Bundle
- **Styling:** CSS + MUI theme tokens
- **Deployment:** Netlify

## Current state

The prototype includes working navigation, page layouts, and UI components for both director and admin personas. The AI assistant UI is built out with mock data structures for documents and chat threads. Document viewing, citation preview, and personalization dialogs are implemented as interactive components. Backend API integration and live AI functionality are not yet implemented.