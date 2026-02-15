# AirXPay Initialization UI – Security Policy

## 🛡 Overview

AirXPay Initialization UI provides React & React Native components for seller onboarding. Security is focused on protecting API keys, sensitive seller data, and safe frontend usage.

---

## 🔒 Security Best Practices

1. **API Key Exposure**
   - Avoid embedding `publicKey` directly in frontend code for production.
   - Consider using a backend proxy for sensitive operations.

2. **Data Handling**
   - Validate all input data before submission.
   - Sanitize seller-provided information.
   - Do not store sensitive data locally without encryption.

3. **Network Security**
   - Always use HTTPS endpoints for API calls.
   - Avoid hardcoded endpoints; configure via `<AirXPayProvider>`.

4. **Dependency Security**
   - Keep React, React Native, and related libraries up-to-date.
   - Regularly audit npm dependencies for vulnerabilities.

5. **Error Handling**
   - Use proper error boundaries in React to prevent sensitive info leakage.
   - Snackbar and notifications should never expose keys or sensitive backend responses.

---

## 📝 Reporting a Vulnerability

- **Do not** create a public issue for security flaws.
- Contact: `tafseel.khan@example.com`
- Provide:
  - Steps to reproduce
  - Affected version
  - Optional suggested fixes

Response guaranteed within **48 hours**.

---

## 🗓 Supported Versions

| Version | Security Support |
|---------|-----------------|
| v1.0.0.x     | ✅ Supported     |
---

## ⚠ Responsible Disclosure

- AirXPay respects responsible disclosure.
- Reported security issues are fixed promptly.
- Reporters may be credited publicly if they wish.

