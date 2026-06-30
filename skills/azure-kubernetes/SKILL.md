---
name: "azure-kubernetes"
description: "Plan, create, and configure production-ready AKS clusters. Day-0 checklist, SKU selection (Automatic vs Standard), networking, security, observability, cost optimization. Triggers: 'AKS', 'Kubernetes', 'AKS cluster', 'container orchestration', 'Defender for Containers'."
---

# Azure Kubernetes Service

> **AUTHORITATIVE GUIDANCE — MANDATORY COMPLIANCE**
> This skill produces a recommended AKS cluster configuration distinguishing Day-0 decisions (hard to change) from Day-1 features (can enable post-creation).

## Quick Reference
| Property | Value |
|----------|-------|
| Best for | AKS cluster planning and Day-0 decisions |
| MCP Tools | `mcp_azure_mcp_aks` |
| CLI | `az aks create`, `az aks show`, `kubectl get`, `kubectl describe` |

## When to Use
- Create a new AKS cluster
- Plan AKS cluster configuration for production
- Design AKS networking (API server, pod IP model, egress)
- Set up identity and secrets management
- Configure governance (Azure Policy, Deployment Safeguards)
- Enable observability (Container Insights, Managed Prometheus, Grafana)
- Define upgrade and patching strategy
- AKS Automatic vs Standard SKU comparison

## Required Inputs
- Environment type: dev/test or production
- Region(s), availability zones, VM sizes
- Expected scale (node/cluster count, workload size)
- Networking requirements
- Security and identity requirements
- Upgrade and observability preferences
- Cost constraints

## Workflow

### 1. Cluster Type
- **AKS Automatic** (default): Curated experience with best practices for security, reliability, performance
- **AKS Standard**: Full control, more setup overhead

### 2. Networking (Day-0 Decisions)
**Pod IP Model**:
- **Azure CNI Overlay** (recommended): Private overlay IPs, scales well
- **Azure CNI (VNet-routable)**: Direct VNet IPs, use when pods must be addressable from VNet/on-prem

**Dataplane**: Azure CNI powered by Cilium (recommended) — eBPF-based
**Egress**: Static Egress Gateway or UDR + Azure Firewall
**Ingress**: App Routing addon with Gateway API (recommended)
**DNS**: Enable LocalDNS on all node pools

### 3. Security
- Microsoft Entra ID everywhere (control plane, Workload Identity, node access)
- Azure Key Vault via Secrets Store CSI Driver
- Azure Policy + Deployment Safeguards
- Encryption at rest (etcd/API server) and in-transit
- Signed images only (Azure Policy + Ratify), prefer ACR
- Namespaces + network policies for isolation

### 4. Observability
- Managed Prometheus + Container Insights + Grafana
- Diagnostic Settings for control plane + audit logs to Log Analytics
- Application Insights, Resource Health, AppLens detectors

### 5. Upgrades & Patching
- Maintenance Windows for controlled timing
- Auto-upgrades for control plane and node OS
- LTS versions for enterprise stability (Premium tier)
- AKS Fleet Manager for staged rollout

### 6. Performance
- Ephemeral OS disks (`--node-osdisk-type Ephemeral`)
- Azure Linux node OS
- KEDA for event-driven autoscaling

### 7. Node Pools & Compute
- Dedicated system node pool (2+ nodes, `CriticalAddonsOnly` taint)
- Node Auto Provisioning (NAP) on all pools
- Latest generation SKUs (v5/v6)
- Avoid B-series VMs
- 4+ vCPUs for production
- Topology spread constraints

### 8. Reliability
- 3 Availability Zones
- Standard tier (zone-redundant control plane, 99.95% SLA)
- **Microsoft Defender for Containers** for runtime protection
- PodDisruptionBudgets for production workloads

### 9. Cost Controls
- Spot node pools for batch/interruptible (up to 90% savings)
- Stop/Start dev/test clusters
- Reserved Instances or Savings Plans for steady-state

## Deep-Dive References (fetch from GitHub when needed)
| Scenario | Reference URL |
|----------|--------------|
| Pod Rightsizing | https://raw.githubusercontent.com/microsoft/azure-skills/main/.github/plugins/azure-skills/skills/azure-kubernetes/references/azure-aks-rightsizing.md |
| VPA Setup | .../azure-aks-vpa.md |
| Cluster Autoscaler | .../azure-aks-autoscaler.md |
| Spot Node Pools | .../azure-aks-spot.md |

## Guardrails
- Do not request or output secrets
- Discover subscription/resource scope via MCP tools or `az account show`
- For ambiguous Day-0 decisions, ask clarifying questions
- For Day-1 features, propose 2-3 safe options with tradeoffs
- Never promise zero downtime; advise PDBs, probes, replicas, staged upgrades


