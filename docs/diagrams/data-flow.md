# Data Flow Diagram (Mermaid)

Traces how raw sheet rows become the dashboard payload.

```mermaid
flowchart LR
    Log[(Daily Log)] --> Balances[_calculateAccountBalances]
    Accounts[(Accounts)] --> Balances
    Balances --> AccList[accounts list + liquidTotal]

    Log --> Filter1[filter by active cycle]
    Filter1 --> Summarize[_summarizeCycle]
    Summarize --> KPIs[totalIncome / totalSpent / bankCharges / totalReceivables]
    Summarize --> Actuals[actualsMap by category]
    Summarize --> Receivables[receivableList]

    Budget[(Budget Setup)] --> Filter2[filter by active cycle]
    Filter2 --> Merge[_mergeBudgets]
    Actuals --> Merge
    Merge --> Expenses[expenses array]
    Merge --> Savings[savings array]

    AccList --> Payload[generateDashboardPayload output]
    KPIs --> Payload
    Expenses --> Payload
    Savings --> Payload
    Receivables --> Payload

    Payload --> CacheWrite[(CacheService, 300s TTL)]
    CacheWrite --> Render[Components + Charts render]
```

## Notes

- `_calculateAccountBalances` runs over **all** transactions regardless of cycle, since account balances are cumulative, not cycle-scoped.
- `_summarizeCycle` and the budget filters operate only on rows matching `Settings.Active_Cycle` (or the requested cycle override).
- The known From/To Account column issue (`docs/TROUBLESHOOTING.md`) affects the `Balances` step specifically, since it consumes `From Account` / `To Account` by header name regardless of which module wrote the row.
