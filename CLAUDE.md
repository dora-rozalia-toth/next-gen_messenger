# Smart Assist

## What this is

Smart Assist is a board governance AI assistant prototype built for the Diligent Atlas platform. It provides board members and administrators with an AI-powered chat interface to ask questions about board documents, meeting minutes, financial plans, and risk assessments. The assistant surfaces relevant document citations and sources alongside answers, helping users quickly find information across their governance materials.

## Key pages and components

- **AIAssistantPage** – Main chat interface with message history, AI responses, and citation previews
- **AdminBooksPage** – Board book management and document administration
- **BookEditorPage** – Editor for creating/modifying board books
- **ResourceCenterPage** – Centralized access to governance documents and materials
- **SettingsPage** – User configuration and preferences
- **SmartAssistSidenav** – Collapsible sidebar for chat threads and navigation
- **CitationPreviewPanel** – Displays document excerpts and sources referenced in AI responses
- **RichAIMessageContent** – Renders formatted AI messages with embedded citations
- **PersonalizationDialog** – User preference settings for the AI assistant
- **DocumentViewerToolbar** – Controls for viewing document pages

## Tech stack

- **React 18** with TypeScript
- **Vite** (build tool)
- **React Router** (navigation)
- **Material-UI (MUI)** (component library)
- **Diligent Atlas React Bundle** (design system and icons)
- **Netlify** (deployment)

## Current state

The prototype has a functional UI structure with routing, context providers for chat state and citation previews, and mock data for documents. The AI integration points are defined but backend connectivity and actual LLM responses appear to be incomplete—see `AGENTS.md` and `AI_ASSISTANT_SETUP.md` for integration details.