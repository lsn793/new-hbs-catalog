---
name: Angular Vite compiler
description: Why this Angular catalog uses JIT compilation with Vite instead of the Analog Angular plugin.
---

The catalog uses Angular's runtime compiler with Vite because installing the Angular Vite adapter required an `@angular/build` dependency whose transitive package was rejected by the workspace package firewall.

**Why:** The JIT approach built and ran successfully without the blocked package, keeping the app fully Angular while preserving the existing Vite workflow.

**How to apply:** Keep `@angular/compiler` loaded before Angular bootstrap unless the dependency-install constraint changes and a compatible AOT adapter is verified.
