## Summary

<!-- What changed and why. -->

## Test plan

- [ ] `python3 tools/build_profile.py` (if catalog, DNS, deny list, or tracker apps changed)
- [ ] Installer loads in **Safari on iPhone** (`python3 -m http.server 8080`)
- [ ] Profile installs (note DNS + extras: PIN / Safari list)
- [ ] iOS version tested: ________ (supported: public iOS 26; full keys from 18.2)

## Checklist

- [ ] Did not add MDM, a custom root CA, or jailbreak steps to `main`
- [ ] Did not hand-edit generated `profiles/*.mobileconfig` or `catalog.json`
- [ ] I agree to license this contribution under the MIT License
