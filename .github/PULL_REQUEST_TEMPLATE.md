## Summary

<!-- What changed and why. -->

## Test plan

- [ ] `python3 build_profile.py` (if settings, DNS, deny list, or tracker apps changed)
- [ ] Installer loads in **Safari on iPhone** (`python3 -m http.server 8080 --directory src`)
- [ ] Profile installs (note DNS + extras: PIN / Safari list)
- [ ] iOS version tested: ________ (supported: public iOS 26; full keys from 18.2)

## Checklist

- [ ] Did not add MDM, a custom root CA, or jailbreak steps to `main`
- [ ] Did not add pip / PyPI dependencies (Python stays stdlib-only)
- [ ] Did not hand-edit generated `src/profiles/*.mobileconfig`
- [ ] I agree to license this contribution under the MIT License
