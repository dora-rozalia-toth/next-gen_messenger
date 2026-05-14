# Smart Assist

## What this is

Smart Assist is a board governance platform prototype built for Diligent that provides directors and administrators with AI-powered document search, summarization, and insights across board materials. The system integrates an AI assistant that can answer questions about meeting minutes, financial statements, strategic plans, and other governance documents, with citation tracking and personalization features.

## Key pages and components

**Pages:**
- `DirectorHomePage` — Director dashboard entry point
- `DirectorBooksPage` — Browse and access board books
- `DirectorBookReaderPage` — View individual board book documents with page navigation
- `DirectorResourceCenterPage` — Resource library for directors
- `AdminBooksPage` — Admin interface for managing board books
- `BookEditorPage` — Create/edit board book content
- `AIAssistantPage` — Dedicated AI chat interface
- `ResourceCenterPage` — Admin resource management
- `SettingsPage` — User preferences

**Key components:**
- `SmartAssistWidget` / `SmartAssistSidenav` — Embedded AI chat interface
- `CitationPreviewPanel` — Shows document sources for AI responses
- `RichAIMessageContent` — Renders formatted AI messages with citations
- `DocumentViewerToolbar` — Controls for document navigation
- `PersonalizationDialog` — User preference settings
- `SourcesBlock` / `SourcesFilterButton` — Citation and source filtering

## Tech stack

- **Framework:** React 18 + TypeScript, Vite
- **Routing:** React Router
- **UI:** Material-UI (MUI), Diligent Atlas React Bundle
- **Styling:** CSS + MUI theme tokens
- **Context:** React Context API (SmartAssist, CitationPreview)
- **Deployment:** Netlify

## Current state

The prototype includes functional page routing, document viewing with mock board materials, and AI assistant UI scaffolding with citation preview panels. Mock data and document images are in place; actual AI backend integration and real search/summarization logic appear to be incomplete or stubbed.