---
name: "azure-enterprise-infra"
description: "Architect enterprise Azure infrastructure: landing zones, hub-spoke networks, VNets, firewalls, private endpoints, DR topologies. Generate Bicep or Terraform. Triggers: 'landing zone', 'hub-spoke', 'Azure infrastructure', 'enterprise infra', 'VNet design', 'Bicep', 'Terraform'."
---

# Azure Enterprise Infra Planner

## When to Use
- Plan enterprise Azure infrastructure from workload/architecture descriptions
- Architect landing zones, hub-spoke networks, multi-region topologies
- Design networking: VNets, subnets, firewalls, private endpoints, VPN gateways
- Plan identity, RBAC, and compliance-driven infrastructure
- Generate Bicep or Terraform for subscription-scope deployments
- Plan disaster recovery, failover, cross-region HA topologies

## Quick Reference
| Property | Details |
|----------|---------|
| MCP tools | `get_azure_bestpractices_get`, `wellarchitectedframework_serviceguide_get`, `microsoft_docs_fetch`, `microsoft_docs_search`, `bicepschema_get` |
| CLI | `az deployment group create`, `az bicep build`, `az resource list`, `terraform init/plan/validate/apply` |

## Workflow

| Phase | Action | Key Gate |
|-------|--------|----------|
| 1 | Research — WAF Tools | All MCP tool calls complete |
| 2 | Research — Refine & Lookup | Resource list approved by user |
| 3 | Plan Generation | Plan JSON written to disk |
| 4 | Verification | All checks pass, user approves |
| 5 | IaC Generation | `meta.status` = `approved` |
| 6 | Deployment | User confirms destructive actions |

### Phase 1: Research with WAF Tools
Use MCP tools to gather best practices:
```
get_azure_bestpractices_get — Azure best practices for deployment
wellarchitectedframework_serviceguide_get — WAF service guide for specific services
microsoft_docs_search — Search Microsoft Learn for documentation
microsoft_docs_fetch — Fetch full content of a Learn page
bicepschema_get — Bicep schema for any Azure resource type
```

### Phase 2: Refine & Lookup
- Clarify requirements with user
- Identify specific Azure services needed
- Define networking topology (hub-spoke, mesh, flat)
- Plan identity and RBAC model
- Get user approval on resource list

### Phase 3: Plan Generation
Generate infrastructure plan covering:
- **Networking**: VNets, subnets, NSGs, route tables, peering, DNS
- **Security**: Firewall, private endpoints, DDoS protection, WAF
- **Identity**: Managed identities, RBAC assignments, PIM
- **Governance**: Policy assignments, resource locks, tags
- **Monitoring**: Diagnostic settings, alerts, dashboards
- **DR/HA**: Paired regions, failover groups, backup policies

Write plan JSON to `<project-root>/.azure/`

### Phase 4: Verification
- Validate against WAF pillars (Reliability, Security, Cost, Operational Excellence, Performance)
- Check SKU compatibility and pairing constraints
- Verify IP address ranges don't overlap
- Get user approval

### Phase 5: IaC Generation
Generate Bicep or Terraform code:
- Module-based structure
- Parameterized for environment (dev/staging/prod)
- Validate: `az bicep build` or `terraform validate`

### Phase 6: Deployment
- Always require explicit user confirmation for destructive actions
- Deploy in stages (networking first, then compute, then applications)
- Verify each stage before proceeding

## Common Architectures

### Hub-Spoke Network
```
Hub VNet: Firewall, VPN Gateway, Bastion
├── Spoke 1: Production workloads
├── Spoke 2: Development/staging
├── Spoke 3: Shared services (DNS, AD DS)
└── Spoke 4: DMZ / external-facing
```

### Landing Zone Components
- Management groups hierarchy
- Subscription vending
- Platform landing zone (connectivity, identity, management)
- Application landing zones

## Error Handling
| Error | Fix |
|-------|-----|
| MCP tool error | Retry once; fall back to reference files |
| Plan approval missing | Stop and prompt user |
| IaC validation failure | Fix code and re-validate |
| Pairing constraint violation | Fix in plan before IaC generation |

## References (fetch from GitHub when needed)
- Workflow: https://raw.githubusercontent.com/microsoft/azure-skills/main/.github/plugins/azure-skills/skills/azure-enterprise-infra-planner/references/workflow.md
- Plan Schema: .../references/plan-schema.md
- WAF Checklist: .../references/waf-checklist.md
- Constraints: .../references/constraints/README.md


