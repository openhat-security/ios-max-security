# Security policy

## Supported versions

We accept reports against the current `main` branch, built for **iOS 26** (public) with restriction keys that apply from **iOS 18.2** onward.

| Line | Supported |
| --- | --- |
| `main` (no-MDM Basic setup) | Yes |
| iOS 27 beta | No |
| Custom CA, jailbreak, or MDM-on-default-profile patches | Out of scope — we will not ship these |

## Reporting a vulnerability

Please **do not** open a public GitHub issue.

1. Prefer GitHub’s private vulnerability reporting on this repository (Security → Report a vulnerability), if it is enabled.
2. Or email **adam@freetech.co** with a description, affected files, and iOS version.

You should hear back within a week. We will not discuss the report in public until a fix is on `main` or we have agreed it is not a vulnerability.

This project cannot read Settings on a user’s iPhone. Reports that a website “cannot verify” leftover taps are expected, not vulnerabilities.
