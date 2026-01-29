# Medlogy Project Plan

## Master Roadmap

### 1. Phase 1: Foundation & Baseline (Completed)
- **Visuals**: High-fidelity design system (Tailwind, Lucide).
- **Architecture**: App Router, Clean separation of concerns.
- **Data Core**: `indicatorRegistry` as single source of truth.
- **Chart Engine**: Yearly-only, unified x-axis, stable rendering.

### 2. Phase 1.5: Data Provenance (Completed)
- **Status System**: Explicit `observed` vs `modeled` vs `simulated` types.
- **Adapters**: Basic IHME file adapter.
- **Registry**: Strict metadata definitions.

### 3. Phase 2: Expansion & Interaction (Current Focus)
- **Indicator Expansion**:
    - Target: 100+ public health indicators.
    - Domains: Arboviral, Infectious Burden, Mortality, Health Systems.
    - Ingestion: Generalized pipeline for IHME, WHO, World Bank, OWID.
- **Advanced Interaction**:
    - "Epidemiologist's TradingView": Measurement tools, overlays, comparative analysis.
    - Non-trading interaction model (yearly focus).
- **UX Philosophy**:
    - Radical transparency on data source/status.
    - Scientific honesty > visual appeal.

### 4. Phase 3: Policy & Decision Support (Future)
- **Objective**: Operational Status signals.
- **System**: Deterministic Policy Matrix.

## Current Trajectory
**Focus**: Phase 2 — Scaling Data & Interaction.
**Goal**: Deploy "Medlogy v1.5" with 100 active indicators and advanced analysis tools.
**Status**: Architecture Planning & Ingestion Design.

## Squad Status
| Agent | Task | Status |
| :--- | :--- | :--- |
| **Antigravity** | Phase 2 Architecture & Ingestion | **Executing** |
