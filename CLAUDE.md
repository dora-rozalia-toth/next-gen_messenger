# Smart Assist

## What this is

Smart Assist is a board governance platform prototype built for Diligent that provides directors and administrators with AI-powered document search and insights across board materials. Directors can browse and read board books, access a resource center, and interact with an AI assistant that answers questions about documents with citations. Administrators can manage and edit board books. The platform integrates with Diligent's Atlas design system and includes mock data for financial reports, meeting minutes, strategic plans, and governance documents.

## Key pages and components

**Pages:**
- **Director Home** – Landing page for directors with personalized content
- **Director Books** – Browse and filter board books with metadata
- **Director Book Reader** – View board book pages with document viewer toolbar
- **Director Resource Center** – Access curated governance resources
- **AI Assistant** – Chat interface with document search, citations, and source filtering
- **Admin Books** – Manage board books (create, edit, delete)
- **Book Editor** – Create/edit book metadata and structure
- **Settings** – User preferences and configuration
- **Resource Center** (admin) – Manage resource materials

**Key Components:**
- `SmartAssistWidget` / `SmartAssistSidenav` – AI chat interface with message threading
- `CitationPreviewPanel` – Preview cited documents inline
- `DocumentViewerToolbar` – Navigate and interact with book pages
- `RichAIMessageContent` – Render AI responses with formatting and sources
- `PersonalizationDialog` – Customize AI assistant behavior
- `SourcesBlock` / `SourcesFilterButton` – Filter and display document sources

## Tech stack

- **Framework:** React 18 + TypeScript, Vite
- **Routing:** React Router
- **UI:** Material-UI (MUI), Diligent Atlas React Bundle
- **Styling:** CSS + MUI theme tokens
- **Deployment:** Netlify
- **Icons:** Atlas icons + MUI SvgIcon

## Current state

The prototype has functional routing, page layouts, and UI components for browsing books and interacting with an AI assistant. Mock data and document page images are in place. The AI assistant logic, backend integration, and real search/citation functionality appear to be placeholder or incomplete based on the component structure.