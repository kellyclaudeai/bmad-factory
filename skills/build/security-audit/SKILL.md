---
name: security-audit
description: Security audit and code review for factory projects. Use when reviewing code for security vulnerabilities, checking authentication/authorization, auditing API security, reviewing data handling, or performing pre-deployment security checks.
---

# Security Audit

Perform security reviews and vulnerability assessments on factory projects before deployment.

## When to Use

- Pre-deployment security review (mandatory for production)
- Code review for security vulnerabilities
- Authentication/authorization audit
- API security review
- Data handling and privacy review
- Dependency vulnerability check

## Security Checklist

### Authentication & Authorization

**Firebase Projects:**
- [ ] Security rules configured (Firestore, Storage, Realtime DB)
- [ ] Authentication enabled and configured
- [ ] Role-based access control implemented where needed
- [ ] No sensitive data in client-side code
- [ ] API keys restricted by domain/bundle ID

**General:**
- [ ] No hardcoded credentials or secrets
- [ ] Environment variables used for sensitive config
- [ ] Token expiry and refresh handled properly
- [ ] Session management secure

### API Security

- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] No sensitive data in URLs or logs
- [ ] Error messages don't leak info
- [ ] HTTPS enforced

### Data Handling

- [ ] User data encrypted at rest (if required)
- [ ] Sensitive data not logged
- [ ] PII handling compliant with requirements
- [ ] Data deletion/export capabilities (if required)
- [ ] No sensitive data in client storage

### Dependencies

- [ ] Run `npm audit` or equivalent
- [ ] Check for known vulnerabilities
- [ ] Dependencies up to date
- [ ] No abandoned/unmaintained packages

### Frontend Security

- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection where needed
- [ ] No eval() or dangerous innerHTML
- [ ] Content Security Policy considered

### Mobile Security (iOS/Android)

- [ ] Certificate pinning (if appropriate)
- [ ] Keychain/Keystore used for secrets
- [ ] No sensitive data in logs
- [ ] ProGuard/R8 enabled (Android)
- [ ] App Transport Security configured (iOS)

## Audit Workflow

1. **Review project requirements** - Understand what security is needed
2. **Run automated checks** - `npm audit`, lint, etc.
3. **Manual code review** - Check authentication, API, data handling
4. **Document findings** - Create `test-artifacts/security-audit.md`
5. **Prioritize issues** - Critical → High → Medium → Low
6. **Create remediation tasks** - Stories or quick fixes

## Output Format

Create `test-artifacts/security-audit.md`:

```markdown
# Security Audit - [Project Name]

**Date:** YYYY-MM-DD
**Auditor:** [Agent Name]
**Status:** PASS | PASS_WITH_NOTES | FAIL

## Summary

[Brief overview of security posture]

## Critical Issues

[Issues that MUST be fixed before deployment]

## High Priority

[Important issues that should be addressed soon]

## Medium Priority

[Issues to address in next iteration]

## Low Priority / Notes

[Minor issues or recommendations]

## Automated Scan Results

[npm audit, dependency check results]

## Recommendations

[General security improvements]
```

## Integration with TEA

Security audit is part of the TEA (Test, Evaluation, Audit) phase:
- Murat (TEA lead) may delegate security audit to this skill
- Security findings become part of the TEA report
- Critical security issues block deployment
- Document in `tea-audit.md` or separate `security-audit.md`

## Common Vulnerabilities to Check

- SQL injection (if using raw queries)
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Authentication bypass
- Authorization bypass
- Sensitive data exposure
- Insecure deserialization
- Using components with known vulnerabilities
- Insufficient logging & monitoring
- Server-side request forgery (SSRF)

## Tools

**Automated:**
- `npm audit` / `yarn audit` (Node.js)
- `pip-audit` (Python)
- `bundle audit` (Ruby)
- GitHub Dependabot alerts
- Snyk, Socket.dev (if available)

**Manual:**
- Code review with security focus
- Test authentication flows
- Review security rules (Firebase)
- Check environment variable usage
- Review API endpoint security

## Firebase-Specific

Check Firebase security rules:

```bash
# Download current rules
firebase firestore:rules:list
firebase firestore:rules:get <rulesetId> > firestore.rules

# Review rules for:
# - Proper authentication checks
# - Data validation
# - Read/write restrictions
# - No wildcard allow rules
```

## Risk Levels

**Critical:** Must fix before deployment (auth bypass, data exposure)
**High:** Should fix before deployment (missing validation, weak permissions)
**Medium:** Should fix in next update (dependency vulnerabilities, logging issues)
**Low:** Nice to have (code quality, minor improvements)

## Notes

- Security audit is MANDATORY before production deployment
- Document all findings even if PASS
- Include automated scan results
- Provide actionable recommendations
- If unsure, escalate to human review
