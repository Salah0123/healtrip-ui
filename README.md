# HealTrip AI — Frontend

HealTrip AI is a prototype patient decision-support assistant with an Angular frontend connected to an ASP.NET Core backend.

The frontend provides a simple bilingual chat interface that allows users to communicate with the AI assistant, maintain a conversation, and receive database-grounded responses from the backend.

> This project is a technical-assessment prototype and is not intended for real-world medical diagnosis or clinical decision-making.

---

## Overview

The frontend provides:

* Angular chat interface
* Arabic / English support
* RTL / LTR support
* Conversation-based chat
* Real-time loading state
* Markdown rendering for AI responses
* Sanitized HTML output
* Enter-to-send behavior
* Shift + Enter for multi-line messages
* Backend API integration
* Basic error handling
* Responsive chat interface

---

## Architecture

```text
┌─────────────────────────────┐
│       Angular Frontend      │
│                             │
│  ┌───────────────────────┐  │
│  │     Chat Component    │  │
│  └───────────┬───────────┘  │
│              │              │
│              ▼              │
│  ┌───────────────────────┐  │
│  │     Chat Service      │  │
│  └───────────┬───────────┘  │
└──────────────┼──────────────┘
               │
               │ HTTP POST
               ▼
┌─────────────────────────────┐
│     ASP.NET Core API        │
│                             │
│       /api/chat             │
└─────────────────────────────┘
```

The Angular application does not communicate directly with PostgreSQL or OpenAI.

All AI orchestration, tool calling, database access, and safety logic are handled by the backend.

---

## Chat Flow

A typical interaction follows this flow:

```text
User
 │
 ▼
Angular Chat UI
 │
 ▼
ChatService
 │
 ▼
POST /api/chat
 │
 ▼
ASP.NET Core Backend
 │
 ▼
AI Orchestrator
 │
 ▼
OpenAI / Backend Tools
 │
 ▼
AI Response
 │
 ▼
Angular Chat UI
```

---

## Conversation Management

Each chat session receives a unique `conversationId`.

The frontend creates the ID when the chat component is initialized:

```typescript
conversationId = crypto.randomUUID();
```

The same ID is sent with every message in the conversation.

Example:

```json
{
  "conversationId": "conversation-001",
  "message": "I want to find a cardiologist in Riyadh."
}
```

This allows the backend to maintain conversation context.

For example:

```text
User:
I want to find a cardiologist in Riyadh.

Assistant:
Dr. Ahmed Hassan
Dr. Sara Mohammed

User:
Which one has more experience?

Assistant:
Dr. Ahmed Hassan has 12 years of experience.
```

---

## Arabic / English Support

The frontend is designed to support both Arabic and English.

The interface can switch between:

```text
English → LTR
Arabic  → RTL
```

The frontend uses the selected language to control the interface direction.

The backend independently detects the language of the user's message and generates the response accordingly.

Mixed-language messages are also supported.

Example:

```text
عايز cardiologist في Riyadh
```

---

## Message Handling

User messages are stored in the component state.

Example message structure:

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

The frontend distinguishes between:

```text
user
assistant
```

This allows the UI to render messages differently.

---

## Signals

Angular Signals are used for reactive UI state.

The component uses signals for:

* Current message
* Chat messages
* Loading state
* Selected language

Example:

```typescript
message = signal('');
messages = signal<ChatMessage[]>([]);
loading = signal(false);
isArabic = signal(false);
```

Signals ensure that UI updates are reflected immediately when asynchronous API responses arrive.

---

## API Integration

The frontend communicates with the backend through `ChatService`.

Example:

```typescript
sendMessage(request: ChatRequest): Observable<ChatResponse> {
  return this.http.post<ChatResponse>(
    this.apiUrl,
    request
  );
}
```

The backend endpoint is:

```http
POST /api/chat
```

Request:

```json
{
  "conversationId": "conversation-001",
  "message": "I want to find a cardiologist in Riyadh."
}
```

Response:

```json
{
  "conversationId": "conversation-001",
  "message": "..."
}
```

---

## Markdown Rendering

AI responses may contain Markdown formatting.

The frontend uses:

* `marked`
* `DOMPurify`

The response is converted from Markdown to HTML and sanitized before being rendered.

Flow:

```text
AI Response
     │
     ▼
Markdown
     │
     ▼
marked
     │
     ▼
HTML
     │
     ▼
DOMPurify
     │
     ▼
Sanitized HTML
     │
     ▼
Angular UI
```

This prevents directly rendering untrusted HTML returned from the AI response.

---

## Keyboard Interaction

The chat input supports common messaging behavior.

### Enter

Pressing `Enter` sends the message.

### Shift + Enter

Pressing `Shift + Enter` creates a new line without sending the message.

Example:

```text
Enter       → Send
Shift+Enter → New line
```

---

## Loading State

While waiting for the backend response, the frontend tracks the request state:

```typescript
loading = signal(false);
```

The state prevents sending multiple messages while a request is still being processed.

The UI can also display a loading indicator to provide feedback to the user.

---

## Error Handling

If the backend request fails, the frontend:

1. Logs the error.
2. Stops the loading state.
3. Adds a user-friendly error message to the conversation.

Example:

```text
An error occurred while contacting the server.
```

The Arabic interface can display:

```text
حدث خطأ أثناء الاتصال بالخادم.
```

---

## Environment Configuration

The backend API URL is configured through Angular environment configuration.

Example:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7142/api'
};
```

The API URL should match the URL where the ASP.NET Core backend is running.

For example:

```text
Frontend:
http://localhost:4200

Backend:
https://localhost:7142
```

---

## Project Structure

```text
healtrip-ui/
│
├── src/
│   │
│   ├── app/
│   │   ├── components/
│   │   │   └── chat/
│   │   │       ├── chat.component.ts
│   │   │       ├── chat.component.html
│   │   │       └── chat.component.css
│   │   │
│   │   ├── services/
│   │   │   └── chat.service.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.config.ts
│   │
│   ├── environments/
│   │   └── environment.ts
│   │
│   └── styles.css
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Technology Stack

* Angular
* TypeScript
* RxJS
* Angular Signals
* Angular HttpClient
* HTML
* CSS
* marked
* DOMPurify

---

## Installation

Install the project dependencies:

```bash
npm install
```

---

## Running the Frontend

Start the Angular development server:

```bash
ng serve
```

The frontend will normally be available at:

```text
http://localhost:4200
```

The ASP.NET Core backend must also be running.

---

## Running the Full Application

The complete application consists of:

```text
┌──────────────────────┐
│   Angular Frontend   │
│   localhost:4200     │
└──────────┬───────────┘
           │
           │ HTTP
           ▼
┌──────────────────────┐
│ ASP.NET Core Backend │
│   localhost:7142     │
└──────────┬───────────┘
           │
           ├──────────────► OpenAI
           │
           ▼
┌──────────────────────┐
│      PostgreSQL      │
│       Docker         │
└──────────────────────┘
```

### Start PostgreSQL

From the backend project:

```bash
docker compose up -d
```

### Start the backend

```bash
dotnet run
```

### Start the frontend

From the Angular project:

```bash
ng serve
```

Then open:

```text
http://localhost:4200
```

---

## CORS

The backend allows requests from the Angular development server:

```text
http://localhost:4200
```

This allows the Angular application to communicate with the ASP.NET Core API during local development.

Production deployments should use an environment-specific CORS configuration.

---

## UI Design

The frontend intentionally uses a simple chat-oriented interface.

The technical assessment focuses primarily on:

* AI interaction
* Tool calling
* Backend architecture
* Database integration
* Safety guardrails
* Conversation context
* Grounded responses

Therefore, the UI intentionally avoids unnecessary complexity.

---

## Security Considerations

The frontend does not contain the OpenAI API key.

The OpenAI API key is stored and used by the backend.

The frontend only communicates with the backend API.

AI-generated Markdown is sanitized with DOMPurify before being rendered as HTML.

For production, additional frontend security measures would be required, including:

* Authentication
* Authorization-aware UI
* Secure token handling
* Content Security Policy
* Production HTTPS
* Input/output validation
* Proper environment configuration

---

## Current Prototype Limitations

The frontend is intentionally scoped for the technical assessment.

Current limitations include:

* No authentication
* No persistent chat history
* No user accounts
* No appointment booking UI
* No real doctor availability UI
* No patient profile
* No production deployment configuration
* Basic error handling
* Development-oriented environment configuration

---

## Future Improvements

Potential future improvements include:

* Authentication and user accounts
* Persistent conversation history
* Conversation list and history navigation
* Doctor and hospital result cards
* Appointment booking interface
* Doctor availability display
* Patient profile
* Improved accessibility
* Better mobile UX
* Production environment configuration
* Automated frontend tests
* End-to-end testing

---

## Disclaimer

HealTrip AI is a technical prototype demonstrating AI-powered patient decision support and backend tool integration.

It does not provide medical diagnosis and should not be used as a substitute for qualified medical professionals.
