---
name: "azure-cost"
description: "Azure cost management: query historical costs, forecast spending, optimize to reduce waste. Find orphaned resources, rightsize VMs, cost breakdown by service/resource/tag. Triggers: 'Azure costs', 'Azure spending', 'cost optimization', 'Azure bill', 'reduce Azure spending', 'orphaned resources', 'rightsize'."
---

# Azure Cost Management Skill

Unified skill for all Azure cost management tasks: querying historical costs, forecasting future spending, and optimizing to reduce waste.

## When to Use
- Query or analyze Azure costs (how much am I spending, show my bill, cost breakdown)
- Break down costs by service, resource, location, or tag
- Analyze cost trends over time
- Forecast future Azure spending or project end-of-month costs
- Optimize Azure costs, reduce spending, or find savings
- Find orphaned or unused resources
- Rightsize Azure VMs, containers, or services

## Quick Reference
| Property | Value |
|----------|-------|
| Query API | `POST {scope}/providers/Microsoft.CostManagement/query?api-version=2023-11-01` |
| Forecast API | `POST {scope}/providers/Microsoft.CostManagement/forecast?api-version=2023-11-01` |
| MCP Tools | `azure__documentation`, `azure__extension_cli_generate`, `azure__get_azure_bestpractices` |
| CLI | `az rest`, `az monitor metrics list`, `az resource list` |
| Required Role | Cost Management Reader + Monitoring Reader + Reader |

## MCP Tools
| Tool | When to Use |
|------|-------------|
| `azure__documentation` | Research Cost Management API parameters |
| `azure__extension_cli_generate` | Construct `az rest` commands for cost queries |
| `azure__get_azure_bestpractices` | Inform query design with best practices |
| `azure__extension_azqr` | Find orphaned resources and optimization opportunities |
| `azure__aks` | AKS cost analysis: list clusters, node pools |

## Routing
| User Intent | Workflow |
|-------------|----------|
| Understand current costs | Cost Query |
| Reduce costs / find waste | Cost Optimization |
| Project future costs | Cost Forecast |
| Full cost picture | All three combined |

## Scope Reference
| Scope | URL Pattern |
|-------|-------------|
| Subscription | `/subscriptions/<id>` |
| Resource Group | `/subscriptions/<id>/resourceGroups/<name>` |
| Management Group | `/providers/Microsoft.Management/managementGroups/<id>` |

## Cost Query Workflow

### Step 1: Determine Scope
```bash
az account list --output table
az account show
```

### Step 2: Query Costs
```bash
az rest --method post \
  --url "/subscriptions/{sub-id}/providers/Microsoft.CostManagement/query?api-version=2023-11-01" \
  --headers "ClientType=GitHubCopilotForAzure" \
  --body '{
    "type": "ActualCost",
    "timeframe": "MonthToDate",
    "dataset": {
      "aggregation": { "totalCost": { "name": "Cost", "function": "Sum" } },
      "grouping": [{ "type": "Dimension", "name": "ServiceName" }]
    }
  }'
```

### Common Groupings
- `ServiceName` - by Azure service
- `ResourceGroupName` - by resource group
- `ResourceLocation` - by region
- `MeterCategory` - by meter
- Custom tags via `TagKey` dimension

## Cost Optimization Workflow

### Step 1: Validate Prerequisites
```bash
az --version && az account show
az extension show --name costmanagement
```

### Step 2: Find Orphaned Resources
```bash
# Unattached disks
az disk list --query "[?managedBy==null]" --output table

# Unused NICs
az network nic list --query "[?virtualMachine==null]" --output table

# Unused public IPs
az network public-ip list --query "[?ipConfiguration==null]" --output table
```

### Step 3: Check VM Utilization
```bash
az monitor metrics list \
  --resource /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/{vm} \
  --metric "Percentage CPU" \
  --interval PT1H \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-31T23:59:59Z
```

### Step 4: Generate Report
Include: total bill, cost breakdown, orphaned resources, rightsizing opportunities, estimated savings, Azure Portal links.

## Cost Forecast Workflow
```bash
az rest --method post \
  --url "/subscriptions/{sub-id}/providers/Microsoft.CostManagement/forecast?api-version=2023-11-01" \
  --headers "ClientType=GitHubCopilotForAzure" \
  --body '{
    "type": "ActualCost",
    "timeframe": "Custom",
    "timePeriod": { "from": "2024-01-01", "to": "2024-01-31" },
    "dataset": {
      "aggregation": { "totalCost": { "name": "Cost", "function": "Sum" } },
      "granularity": "Daily"
    }
  }'
```

## Data Classification
- **ACTUAL DATA** = From Azure Cost Management API
- **ACTUAL METRICS** = From Azure Monitor
- **VALIDATED PRICING** = From official Azure pricing pages
- **ESTIMATED SAVINGS** = Calculated from actual data + validated pricing

## Best Practices
- Always query actual costs — never estimate or assume
- Always present the total bill alongside optimization recommendations
- Validate pricing from official sources — account for free tiers
- Use REST API for cost queries (more reliable than `az costmanagement query`)
- Always include `ClientType: GitHubCopilotForAzure` header
- For costs < $10/month, emphasize operational improvements over financial savings
- Never execute destructive operations without explicit approval
- On 429 responses, wait for the longest retry-after header value

## Safety
- Get approval before deleting resources
- Test changes in non-production first
- Provide dry-run commands
- Include rollback procedures


