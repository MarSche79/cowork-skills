---
name: "mcp-builder"
description: "Guide for building high-quality MCP (Model Context Protocol) servers. Four-phase workflow: research, implementation, testing, evaluation. TypeScript (recommended) and Python support. Triggers: 'build MCP server', 'create MCP', 'MCP development'."
---

# MCP Server Development Guide

## Overview
Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools.

## Reference Files
Local reference files are at: C:\Users\<username>\.copilot\skills\mcp-builder\reference\
- mcp_best_practices.md - Core MCP guidelines
- node_mcp_server.md - TypeScript patterns and examples

For additional references, fetch from GitHub:
- Python Guide: https://raw.githubusercontent.com/anthropics/skills/main/skills/mcp-builder/reference/python_mcp_server.md
- Evaluation Guide: https://raw.githubusercontent.com/anthropics/skills/main/skills/mcp-builder/reference/evaluation.md
- MCP Protocol Spec: https://modelcontextprotocol.io/sitemap.xml
- TypeScript SDK: https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md
- Python SDK: https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md

## High-Level Workflow

### Phase 1: Deep Research and Planning

#### 1.1 Understand Modern MCP Design
- **API Coverage vs Workflow Tools**: Balance comprehensive API coverage with specialized workflow tools. When uncertain, prioritize comprehensive API coverage.
- **Tool Naming**: Use snake_case with service prefix (e.g., `github_create_issue`). Be action-oriented and specific.
- **Context Management**: Concise tool descriptions, filter/paginate results, return focused data.
- **Error Messages**: Guide agents toward solutions with specific suggestions and next steps.

#### 1.2 Study MCP Protocol Documentation
Start with sitemap: `https://modelcontextprotocol.io/sitemap.xml`
Key topics: specification overview, transport mechanisms (streamable HTTP, stdio), tool/resource/prompt definitions.

#### 1.3 Study Framework Documentation
**Recommended stack**: TypeScript + Streamable HTTP (remote) or stdio (local).
Read the local reference files before starting implementation.

#### 1.4 Plan Implementation
Review the service's API docs, identify key endpoints, auth requirements, data models. List endpoints to implement.

### Phase 2: Implementation

#### 2.1 Project Structure (TypeScript)
```
{service}-mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # McpServer initialization
│   ├── types.ts           # Type definitions
│   ├── tools/             # Tool implementations
│   ├── services/          # API clients
│   ├── schemas/           # Zod schemas
│   └── constants.ts       # Shared constants
└── dist/
```

#### 2.2 Core Infrastructure
- API client with authentication
- Error handling helpers
- Response formatting (JSON/Markdown)
- Pagination support

#### 2.3 Implement Tools
For each tool, define:
- **Input Schema**: Zod (TS) or Pydantic (Python) with constraints, descriptions, examples
- **Output Schema**: `outputSchema` + `structuredContent` for structured data
- **Description**: Concise summary, parameter docs, return type schema
- **Annotations**: readOnlyHint, destructiveHint, idempotentHint, openWorldHint
- **Implementation**: Async/await, proper error handling, pagination support

**IMPORTANT - Use Modern APIs Only:**
- DO use: `server.registerTool()`, `server.registerResource()`, `server.registerPrompt()`
- DO NOT use: deprecated `server.tool()` or manual handler registration

### Phase 3: Review and Test
- No duplicated code (DRY)
- Consistent error handling
- Full type coverage
- Clear tool descriptions
- Build: `npm run build`
- Test with MCP Inspector: `npx @modelcontextprotocol/inspector`

### Phase 4: Create Evaluations
Create 10 complex, realistic, read-only evaluation questions. Each must be:
- Independent, non-destructive, idempotent
- Complex (requiring multiple tool calls)
- Verifiable with single, clear answer
- Stable (answer won't change)

Output format:
```xml
<evaluation>
  <qa_pair>
    <question>Your question here</question>
    <answer>Single verifiable answer</answer>
  </qa_pair>
</evaluation>
```


