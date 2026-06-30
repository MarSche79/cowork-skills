---
name: "azure-observability"
description: "Query metrics, logs, and traces across Azure Monitor, Application Insights, and Log Analytics. KQL query patterns, monitoring strategy, observability dashboards. Triggers: 'Azure Monitor', 'App Insights', 'Log Analytics', 'KQL', 'Azure observability', 'Azure metrics'."
---

# Azure Observability Services

## Services
| Service | Use When | MCP Tools | CLI |
|---------|----------|-----------|-----|
| Azure Monitor | Metrics, alerts, dashboards | `azure__monitor` | `az monitor` |
| Application Insights | APM, distributed tracing | `azure__applicationinsights` | `az monitor app-insights` |
| Log Analytics | Log queries, KQL | `azure__kusto` | `az monitor log-analytics` |
| Alerts | Notifications, actions | - | `az monitor alert` |
| Workbooks | Interactive reports | `azure__workbooks` | - |

## MCP Server (Preferred)
When Azure MCP is enabled:

### Monitor
- `azure__monitor` with command `monitor_metrics_query` - Query metrics
- `azure__monitor` with command `monitor_logs_query` - Query logs with KQL

### Application Insights
- `azure__applicationinsights` with command `applicationinsights_component_list` - List App Insights resources

### Log Analytics
- `azure__kusto` with command `kusto_cluster_list` - List clusters
- `azure__kusto` with command `kusto_query` - Execute KQL queries

## CLI Reference
```bash
# List Log Analytics workspaces
az monitor log-analytics workspace list --output table

# Query logs with KQL
az monitor log-analytics query \
  --workspace WORKSPACE_ID \
  --analytics-query "AzureActivity | take 10"

# List Application Insights
az monitor app-insights component list --output table

# List alerts
az monitor alert list --output table

# Query metrics
az monitor metrics list \
  --resource RESOURCE_ID \
  --metric "Percentage CPU"
```

## Common KQL Queries

### Recent Errors
```kql
AppExceptions
| where TimeGenerated > ago(1h)
| project TimeGenerated, Message, StackTrace
| order by TimeGenerated desc
```

### Request Performance
```kql
AppRequests
| where TimeGenerated > ago(1h)
| summarize avg(DurationMs), count() by Name
| order by avg_DurationMs desc
```

### Resource Usage
```kql
AzureMetrics
| where TimeGenerated > ago(1h)
| where MetricName == "Percentage CPU"
| summarize avg(Average) by Resource
```

### Security Sign-in Analysis
```kql
SigninLogs
| where TimeGenerated > ago(24h)
| summarize count() by ResultType, AppDisplayName
| order by count_ desc
```

### Failed Operations
```kql
AzureActivity
| where TimeGenerated > ago(1d)
| where ActivityStatusValue == "Failed"
| project TimeGenerated, OperationNameValue, Caller, ActivityStatusValue
| order by TimeGenerated desc
```

### Sentinel-Relevant: Security Events
```kql
SecurityEvent
| where TimeGenerated > ago(1h)
| summarize count() by EventID, Activity
| order by count_ desc
```

## Monitoring Strategy
| What to Monitor | Service | Metric/Log |
|----------------|---------|------------|
| Application errors | App Insights | Exceptions, failed requests |
| Performance | App Insights | Response time, dependencies |
| Infrastructure | Azure Monitor | CPU, memory, disk |
| Security | Log Analytics | Sign-ins, audit logs |
| Costs | Cost Management | Budget alerts |

## Workbooks
Use Azure Monitor Workbooks for interactive observability dashboards:
- Combine metrics, logs, and alerts in a single view
- Create parameterized reports
- Share across teams

## Best Practices
1. Enable diagnostic settings on all critical resources
2. Use managed Prometheus + Grafana for Kubernetes workloads
3. Centralize logs in a single Log Analytics workspace where practical
4. Set up action groups for critical alerts
5. Use KQL functions for reusable query patterns
6. Monitor both infrastructure and application layers


