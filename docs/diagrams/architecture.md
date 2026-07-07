# Architecture Diagram (Mermaid)

Renders natively in GitHub. Source of truth for the component diagram referenced in `docs/ARCHITECTURE.md` and the portfolio case study.

```mermaid
flowchart TB
    subgraph Sheets["Google Sheets UI"]
        Menu[menu.js<br/>Menu.build / onOpen]
    end

    subgraph Frontend["Dashboard (HtmlService)"]
        Dashboard[dashboard.html]
        Components[components.js.html]
        Charts[charts.js.html]
        Animations[animations.js.html]
        AppJS[dashboard.js.html<br/>App state + fetch]
    end

    subgraph Backend["Apps Script Backend"]
        API[api.js<br/>google.script.run endpoints]
        Engine[financeEngine.js<br/>pure business logic]
        Gateway[gateway.js<br/>doPost webhook]
        Automation[automation.js<br/>cycle rollover]
        Analytics[analytics.js<br/>native charts]
        DB[database.js<br/>Data Access Layer]
        Cache[(CacheService)]
    end

    subgraph Storage["Google Sheets Storage"]
        Settings[(Settings)]
        Accounts[(Accounts)]
        Budget[(Budget Setup)]
        Log[(Daily Log)]
        AnalyticsSheet[(Analytics)]
    end

    External[Telegram / n8n / curl] -->|POST JSON| Gateway

    Menu -->|showModalDialog| Dashboard
    Dashboard --> Components
    Dashboard --> Charts
    Dashboard --> Animations
    Dashboard --> AppJS
    AppJS -->|google.script.run| API

    API --> Cache
    API --> Engine
    Gateway --> DB
    Gateway --> API
    Automation --> DB
    Automation --> API
    Analytics --> Engine
    Engine --> DB

    DB --> Settings
    DB --> Accounts
    DB --> Budget
    DB --> Log
    Analytics --> AnalyticsSheet
```

## Legend

- Solid arrows: direct function calls or data reads/writes.
- `Cache`: `CacheService.getDocumentCache()`, keyed per budget cycle, 300s TTL by default.
- `DB`: the only module permitted to call `SpreadsheetApp` (see `CONTRIBUTING.md` module boundaries).
