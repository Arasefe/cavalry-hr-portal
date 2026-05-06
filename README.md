# cavalry-hr-portal

A SAML 2.0 demo application styled as an HR employee portal. Part of the Cavalry SSO demo suite — used alongside `cavalry-dev-tools` and `cavalry-finance` to demonstrate that a single Entra ID login grants access to multiple independent applications.

## Overview

| Property | Value |
|----------|-------|
| Port | 3001 |
| Protocol | SAML 2.0 |
| Identity Provider | Microsoft Entra ID (Cavalry tenant) |
| Entity ID | `https://Cavalry77.onmicrosoft.com/cavalry-hr-portal` |
| ACS URL | `http://localhost:3001/auth/saml/callback` |
| Theme | Employee portal — onboarding, records, payroll |

## Prerequisites

- Node.js 18+
- An Entra ID user assigned to the `cavalry-hr-portal` Enterprise Application

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. The `.env` file is pre-configured. No changes needed for local development.

3. Assign your user in Entra ID:
   - Go to **Entra ID → Enterprise Applications → cavalry-hr-portal → Users and groups**
   - Click **Add user/group** and assign yourself

## Running

```bash
npm start
```

Then open `http://localhost:3001` in your browser.

## SSO Demo Instructions

Run all three apps in the suite simultaneously to demonstrate Single Sign-On:

```bash
# Terminal 1
cd ~/Desktop/cavalry-hr-portal && npm start

# Terminal 2
cd ~/Desktop/cavalry-dev-tools && npm start

# Terminal 3
cd ~/Desktop/cavalry-finance && npm start
```

**Demo sequence for students:**
1. Open `http://localhost:3001` — click Sign in, complete Entra ID login (credentials + MFA)
2. Open `http://localhost:3002` — click Sign in — **no credentials prompted** (SSO)
3. Open `http://localhost:3003` — click Sign in — **no credentials prompted** (SSO)
4. Point out that each app shows the same claims from the same Entra ID assertion
5. Log out of one app, try another — show that each app manages its own local session

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | HR Portal landing page |
| `GET /auth/saml` | Initiates SAML login |
| `POST /auth/saml/callback` | ACS URL — receives SAML assertion |
| `GET /auth/saml/metadata` | SP metadata XML |
| `GET /dashboard` | Authenticated view with SAML claims table |
| `GET /logout` | Destroys local session |

## Entra ID Registration

| Setting | Value |
|---------|-------|
| Enterprise App | `cavalry-hr-portal` |
| Service Principal ID | `5b360af5-4700-43cb-9769-32256e725aa2` |
| App Registration ID | `aca6a350-1588-4bbe-a3e2-074a83271f3a` |
| SSO Mode | SAML |
| Tenant | Cavalry (`61afc170-5fe3-4cd5-adaf-95fcfe0b6897`) |

## What This App Teaches

- **SAML as an authentication handoff**: The HR portal never handles passwords — it delegates identity verification entirely to Entra ID
- **Claims-based identity**: The dashboard displays every claim received in the SAML assertion (name, email, object ID, etc.)
- **Session independence**: Each app in the suite maintains its own local session — logging out of HR does not log you out of Dev Tools or Finance
- **User assignment**: Only users assigned to this Enterprise App in Entra ID can receive a valid SAML assertion for it
