# cavalry-sso-saml-hr

A Microsoft Entra ID SAML 2.0 demo app themed around an HR employee portal. Part of the Cavalry SSO demo suite.

**Port:** `3001` · **Protocol:** SAML 2.0 · **Library:** `@node-saml/passport-saml`

---

## Teaching Focus

This app teaches **claims-based identity** and **SAML session independence**.

Students will see:
- Every claim received in the SAML assertion (name, email, object ID, groups, etc.)
- That the HR portal never handles passwords — it delegates identity entirely to Entra ID
- That each app in the suite maintains its own local session — logging out of HR does not log you out of Dev Tools or Finance
- User assignment: only users assigned to this Enterprise App in Entra ID can receive a valid SAML assertion

---

## Prerequisites

- Node.js 18+
- A Microsoft Entra ID tenant
- An Entra ID user assigned to the `cavalry-sso-saml-hr` Enterprise Application

---

## Overview

| Property | Value |
|---|---|
| Port | `3001` |
| Protocol | SAML 2.0 |
| Identity Provider | Microsoft Entra ID (Cavalry tenant) |
| Entity ID | `https://Cavalry77.onmicrosoft.com/cavalry-hr-portal` |
| ACS URL | `http://localhost:3001/auth/saml/callback` |
| Theme | Employee portal — onboarding, records, payroll |

---

## Setup

```bash
npm install
cp .env.example .env
```

Assign your user in Entra ID:
- Go to **Entra ID → Enterprise Applications → cavalry-sso-saml-hr → Users and groups**
- Click **Add user/group** and assign yourself

---

## Run

```bash
npm start
```

Navigate to `http://localhost:3001` and click **Sign in with Microsoft Entra ID**.

---

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /` | HR Portal landing page |
| `GET /auth/saml` | Initiates SAML login — redirects to Entra ID |
| `POST /auth/saml/callback` | ACS URL — receives signed SAML assertion |
| `GET /auth/saml/metadata` | SP metadata XML |
| `GET /dashboard` | Authenticated view — SAML claims table |
| `GET /logout` | Destroys local session |

---

## SSO Demo Sequence

```bash
# Terminal 1
cd ~/Desktop/cavalry-sso-saml-hr && npm start

# Terminal 2
cd ~/Desktop/cavalry-sso-saml-devtools && npm start

# Terminal 3
cd ~/Desktop/cavalry-sso-saml-finance && npm start
```

**Demo sequence:**
1. Open `http://localhost:3001` — sign in (credentials + MFA)
2. Open `http://localhost:3002` — **no login prompt** (SSO session reused)
3. Open `http://localhost:3003` — **no login prompt** (SSO session reused)
4. Log out of one app — show that the other two remain authenticated (independent local sessions)

---

## Entra ID Registration

| Setting | Value |
|---|---|
| Enterprise App | `cavalry-sso-saml-hr` |
| Service Principal ID | `5b360af5-4700-43cb-9769-32256e725aa2` |
| App Registration ID | `aca6a350-1588-4bbe-a3e2-074a83271f3a` |
| SSO Mode | SAML |
| Tenant | Cavalry (`61afc170-5fe3-4cd5-adaf-95fcfe0b6897`) |

---

## Part of the Cavalry Demo Suite

| App | Port | Protocol | Focus |
|---|---|---|---|
| `cavalry-sso-saml-hr` | 3001 | SAML | SAML claims table |
| `cavalry-sso-saml-devtools` | 3002 | SAML | Raw SAML assertion payload |
| `cavalry-sso-saml-finance` | 3003 | SAML | User assignment access control |
| `cavalry-sso-saml-portal` | 3004 | SAML | SP-initiated SAML flow walkthrough |
| `cavalry-sso-saml-operations` | 3005 | SAML | Session metadata & continuity |
| `cavalry-sso-oidc-finance` | 4001 | OIDC | ID Token claims & JWT structure |
| `cavalry-sso-oidc-hr` | 4002 | OIDC | SSO session reuse & `sid` claim |
| `cavalry-sso-oidc-marketing` | 4003 | OIDC | Scopes, access token vs ID token |
