# Production domain security baseline

- **Domain:** `seepoundcoffeepie.com`
- **Recorded:** 2026-08-27
- **Last public verification in this record:** 2026-08-27 at approximately 21:12 UTC
- **Status:** Active production baseline

This record captures the domain and edge-security state verified after the 2026-08-27 Cloudflare hardening review. It distinguishes public evidence from settings that can only be confirmed in Cloudflare's dashboard. It contains no API tokens, OAuth secrets, session secrets, learner-data secrets, private assessment data, or transient OAuth values.

The baseline covers the production apex domain, its `www` redirect, Cloudflare edge controls, public security reporting, authentication entry points, and cache behavior. The isolated code-runner threat model remains in [the runner security contract](RUNNER_SECURITY_CONTRACT.md).

## Enabled controls

| Control | Recorded state | Evidence on 2026-08-27 |
| --- | --- | --- |
| DNSSEC | Enabled | Cloudflare showed DNSSEC active. Public resolver queries returned the authenticated-data flag and a DS record with key tag `2371`, algorithm `13`, and digest type `2`. |
| SSL/TLS mode | Full (strict) | Confirmed in Cloudflare's SSL/TLS dashboard. This protects the Cloudflare-to-origin connection. A public browser request alone cannot prove this dashboard setting. |
| Always Use HTTPS | Enabled | Plain HTTP requests to the apex and `www` names returned `301` redirects to HTTPS while retaining the requested path and query string. |
| Automatic HTTPS Rewrites | Enabled | Confirmed in Cloudflare's SSL/TLS dashboard. |
| Minimum TLS version | TLS 1.2 | TLS 1.0 and TLS 1.1 handshakes were rejected. TLS 1.2 and TLS 1.3 handshakes succeeded with valid certificates. |
| TLS 1.3 | Enabled | A TLS 1.3 handshake completed with `TLS_AES_256_GCM_SHA384`. |
| HTTP/2 and HTTP/3 | Enabled | Confirmed in Cloudflare's dashboard. Live responses used HTTP/2 and advertised HTTP/3 through `alt-svc`. |
| HTTP/2 to origin | Enabled | Confirmed in Cloudflare's dashboard. |
| 0-RTT | Disabled | Confirmed in Cloudflare's dashboard. This avoids replay-sensitive early requests. |
| Opportunistic Encryption | Enabled | Confirmed in Cloudflare's dashboard. |
| Universal SSL | Active | The active Universal SSL certificate and backup certificate were visible in Cloudflare's dashboard. |
| HSTS | Enabled for six months | HTTPS responses returned `Strict-Transport-Security: max-age=15552000`. `includeSubDomains` and preload remain off. |
| MIME sniffing protection | Enabled | HTML, JSON, image, text, and blocked-probe responses returned `X-Content-Type-Options: nosniff`. |
| Cloudflare managed WAF rules | Active | Cloudflare's managed ruleset was shown as always active. |
| Browser Integrity Check | Enabled | Confirmed in Cloudflare's security settings. |
| Security Level | Automated | Confirmed in Cloudflare's security settings. Challenge passage remained at its 30-minute default. |
| DDoS protection | Active | Cloudflare's default network and application DDoS protections were shown as running. |
| Common probe blocking | Active | The custom rule `Block common secret and CMS probes` returned `403` for representative secret, source-control, and WordPress probe paths. |
| Private API cache bypass | Active | The cache rule `Never cache private API responses` bypasses cache when the URI path starts with `/api/`. Live authentication and runner responses retained `Cache-Control: no-store` and did not report a cache hit. |
| Client-side script monitoring | Enabled, report-only | Confirmed in Cloudflare's dashboard with hostname-only logging. Report-only mode observes changes without blocking the learner interface. |
| Security contact file | Enabled | `/.well-known/security.txt` returned `200`, `text/plain`, an HTTPS canonical URL, an English language preference, and the private GitHub reporting URL. |
| GitHub private vulnerability reporting | Enabled | GitHub's repository API reported private vulnerability reporting as enabled. |

The custom WAF expression recorded in Cloudflare is:

```text
(http.request.uri.path in {"/.env" "/.git/config" "/.git/HEAD" "/.svn/entries" "/.hg/store" "/wp-login.php" "/wp-admin" "/wp-admin/" "/xmlrpc.php" "/phpmyadmin" "/phpmyadmin/"})
```

Its action is `Block`. The rule is intentionally narrow. It does not block `robots.txt`, `sitemap.xml`, application routes, authentication routes, runner routes, or static social assets.

The published security contact is:

```text
Canonical: https://seepoundcoffeepie.com/.well-known/security.txt
Contact: https://github.com/AES256Afro/SeePoundCoffeePie/security/advisories/new
Expires: 2027-08-27T23:59:00Z
Preferred-Languages: en
```

Renew or replace the file before its expiry. Do not publish a personal email address unless the owner explicitly chooses to do so.

## Public verification evidence

These checks were repeated after the Cloudflare changes.

| Request or check | Observed result |
| --- | --- |
| `https://seepoundcoffeepie.com/` | `200`, HTML, HSTS, `nosniff` |
| `http://seepoundcoffeepie.com/example/path?sample=1` | `301` to the same path and query on the HTTPS apex |
| `http://www.seepoundcoffeepie.com/example/path?sample=1` | `301` to HTTPS `www`, followed by the existing `308` canonical redirect to the HTTPS apex |
| `https://seepoundcoffeepie.com/api/auth/session` | `200`, JSON, `Cache-Control: no-store`, HSTS, `nosniff`; signed-out response was `{"authenticated":false,"user":null}` |
| `https://seepoundcoffeepie.com/api/runner/status` | `200`, JSON, `Cache-Control: no-store`, HSTS, `nosniff`; the runner reported Python, C++, C#, and Java enabled |
| `https://seepoundcoffeepie.com/api/auth/github/start` | `302` to GitHub with the exact production callback, PKCE `S256`, and short-lived `Secure`, `HttpOnly`, `SameSite=Lax` state cookies |
| `/.env`, `/.git/config`, and `/wp-admin` | `403` from the edge rule |
| `/.well-known/security.txt` | `200`, `text/plain`, HSTS, `nosniff` |
| `/robots.txt` and `/sitemap.xml` | `200`; public discovery remained available |
| `/social-card-v7.jpg` | `200`, JPEG, 217,554 bytes; link previews remained available |
| `npm run check:live` | Passed for the asset graph, sitemap, robots file, social preview, redirects, headers, canonical routes, compatibility routes, and unpublished C++ boundaries |
| `npm run check:runner:smoke` | Passed against production in 25 ms |
| `npm run check:runner:python-data-tools:production` | Passed all seven assessment and integrity checks in 29 ms |

The production `www` redirect is secure and preserves navigation state, but an HTTP `www` request currently takes two redirects to reach the apex. That is an efficiency issue, not a failed security control.

## Deliberately disabled or unchanged controls

These settings were reviewed and left as shown. They must not be described as omissions without the associated reason.

| Control | State | Reason |
| --- | --- | --- |
| Bot Fight Mode | Off | On the Free plan, its mitigation cannot be skipped with a custom WAF rule. It could challenge the scheduled production monitor, code-runner API calls, or legitimate shared-network learners. |
| AI Labyrinth | Off | It is a crawler-diversion feature, not protection for GitHub OAuth, learner records, or the isolated runner. It is not required for this baseline. |
| Certificate Transparency Monitoring | Off pending owner approval | Enabling it creates an email-alert subscription. The security benefit is reasonable, but notification subscriptions require the owner's explicit choice. |
| HSTS `includeSubDomains` | Off | Subdomains must be inventoried and proven HTTPS-only before a parent-domain HSTS policy is expanded. |
| HSTS preload | Off | Browser preload is long-lived and difficult to reverse. Six-month apex HSTS provides protection without accepting that recovery cost. |
| Under Attack mode | Off | It adds broad interstitial challenges and is reserved for an active attack. |
| Hotlink Protection | Off | Blocking third-party image loading could break the intentional social preview. |
| Broad edge rate limiting | Not added | The application already has scoped runner limits. A broad rule risks false positives for schools, libraries, and households sharing one public address. |
| Cloudflare Access on the academy | Not added | The academy is public. Access would put a second sign-in barrier in front of visitors and conflict with optional GitHub identity. |
| Leaked credential detection | Not applicable | The site does not accept or store passwords. GitHub handles identity authentication. |
| New enforced Content Security Policy | Not added | A second, unreviewed policy could break Worker assets, OAuth, or lesson behavior. CSP changes require a source-level review and browser regression test. |
| CAA records | Not added | The complete certificate-issuer inventory must be established first. An incomplete CAA policy can prevent renewal. |
| Null MX, SPF, or DMARC records | Not added | The owner has not declared that the domain will never be used for email. Adding a no-mail policy now could block a future intended mailbox. |
| Production `workers.dev` address | Unchanged | The production Worker remains reachable through its `workers.dev` address, which is outside this custom domain's zone-level WAF. Removing it belongs in a reviewed Worker configuration release that preserves staging access. |

No secrets were rotated. No DNS host records, MX records, application source, runner images, learner data, GitHub OAuth registration fields, Cloudflare Access policies, or staging settings were changed by this domain-hardening slice.

## Owner decisions still open

1. **Certificate Transparency alerts:** approve or decline the Cloudflare email subscription. If approved, enable Certificate Transparency Monitoring and verify that the intended account address receives the subscription.
2. **Production `workers.dev` exposure:** decide whether production should set `workers_dev: false`. Make this change through the normal staging and production release process, not as an isolated dashboard edit.
3. **Domain email use:** decide whether `seepoundcoffeepie.com` may send or receive mail. Only then create the appropriate MX, SPF, DKIM, and DMARC policy, or a deliberate no-mail policy.
4. **CAA policy:** inventory every issuer Cloudflare may need, including backup and managed certificate paths, before restricting certificate issuance.
5. **Expanded HSTS:** reconsider `includeSubDomains` and preload only after every current and planned subdomain is HTTPS-only and recovery ownership is documented.
6. **Cloudflare security scan:** review and record the result of the scan started during this hardening session. The scan had not finished when its dashboard was last inspected, so this baseline does not claim a completed scan result.

## Reproducible checks

Run public checks from a network that is not using an authenticated browser session. Commands intentionally avoid printing secret values.

### Repository release checks

```bash
npm run check:live
npm run check:runner:smoke
npm run check:runner:python-data-tools:production
```

### Headers and cache behavior

```bash
curl -sS -o /dev/null -D - https://seepoundcoffeepie.com/
curl -sS -o /dev/null -D - https://seepoundcoffeepie.com/api/auth/session
curl -sS -o /dev/null -D - https://seepoundcoffeepie.com/api/runner/status
curl -sS https://seepoundcoffeepie.com/.well-known/security.txt
```

Expected security properties:

- the homepage returns HSTS and `nosniff`;
- authentication and runner APIs return `Cache-Control: no-store` and never `CF-Cache-Status: HIT`;
- the security file uses HTTPS URLs and has not expired;
- no response reveals a secret, OAuth verifier, learner record, or protected assessment input.

### Redirects and probe blocking

```bash
curl -sS -o /dev/null -D - 'http://seepoundcoffeepie.com/example/path?sample=1'
curl -sS -o /dev/null -D - 'http://www.seepoundcoffeepie.com/example/path?sample=1'
curl -sS -o /dev/null -D - https://seepoundcoffeepie.com/.env
curl -sS -o /dev/null -D - https://seepoundcoffeepie.com/.git/config
curl -sS -o /dev/null -D - https://seepoundcoffeepie.com/wp-admin
```

The redirects must preserve the path and query. The three probes must return `403`. A legitimate application route, `robots.txt`, `sitemap.xml`, and the social image must remain available.

### TLS versions

```bash
printf '' | openssl s_client -tls1 -connect seepoundcoffeepie.com:443 -servername seepoundcoffeepie.com -brief
printf '' | openssl s_client -tls1_1 -connect seepoundcoffeepie.com:443 -servername seepoundcoffeepie.com -brief
printf '' | openssl s_client -tls1_2 -connect seepoundcoffeepie.com:443 -servername seepoundcoffeepie.com -brief
printf '' | openssl s_client -tls1_3 -connect seepoundcoffeepie.com:443 -servername seepoundcoffeepie.com -brief
```

TLS 1.0 and 1.1 must fail. TLS 1.2 and 1.3 must complete with certificate verification successful.

### DNSSEC

```bash
dig @1.1.1.1 seepoundcoffeepie.com A +dnssec +noall +comments +answer
dig @1.1.1.1 seepoundcoffeepie.com DS +dnssec +noall +comments +answer
```

The answer must contain the `ad` flag. The DS record at the time of this baseline used key tag `2371`, algorithm `13`, and digest type `2`. If Cloudflare rotates the key, a different valid DS value is expected and this record should be superseded rather than forcing the old value back into service.

### Dashboard-only review

Public requests cannot prove every Cloudflare control. In the Cloudflare dashboard, review these exact areas for the production zone:

- DNS > Settings: DNSSEC active;
- SSL/TLS > Overview: Full (strict);
- SSL/TLS > Edge Certificates: Always Use HTTPS on, Automatic HTTPS Rewrites on, minimum TLS 1.2, TLS 1.3 on, HSTS six months, `includeSubDomains` off, preload off, 0-RTT off;
- Security > WAF: managed rules active and `Block common secret and CMS probes` active;
- Security settings: Browser Integrity Check on and Security Level automated;
- Caching > Cache Rules: `Never cache private API responses` active for paths beginning `/api/`;
- Client-side security: script monitoring on in report-only mode with hostname-only logging;
- Security settings: Security.txt on and its expiry still in the future.

Record the date, reviewer, changed settings, and live check results after any future change. Do not copy secret values into the record.

## Rollback and change cautions

- Treat HSTS as cached browser state. Turning it off at Cloudflare does not immediately remove a policy already stored by a browser. Do not enable preload as an experiment.
- If Full (strict) reports an origin problem, repair the origin or Worker certificate path. Do not lower encryption mode as a routine workaround.
- Coordinate DNSSEC changes at Cloudflare and the parent zone. Removing or replacing only one side can make the domain return `SERVFAIL`.
- Keep the `/api/` cache-bypass rule ahead of any future broad cache rule. Authentication, learner-record, runner-grant, runner-result, and account-deletion responses must never be cached.
- Keep the custom WAF rule path-specific. Test GitHub sign-in, runner status, one real runner check, `robots.txt`, `sitemap.xml`, and the social card after changing it.
- Preserve the GitHub callback exactly as `https://seepoundcoffeepie.com/api/auth/github/callback` unless the application and GitHub OAuth registration are changed together.
- Renew `security.txt` before 2027-08-27T23:59:00Z and recheck the private reporting URL after repository ownership or visibility changes.
- Use Under Attack mode only during an active incident, then turn it back off after the incident is controlled and normal traffic is verified.
- Apply the production `workers_dev` decision, CSP changes, certificate restrictions, and email policy through reviewed releases with a rollback path. They are not safe one-click follow-ups.

This document is a dated baseline, not a promise that controls cannot drift. Supersede it after a material DNS, TLS, WAF, cache, authentication, Worker-routing, certificate, or security-reporting change.
