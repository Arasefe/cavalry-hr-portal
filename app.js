require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { Strategy: SamlStrategy } = require("@node-saml/passport-saml");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 8 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());

const samlStrategy = new SamlStrategy(
  {
    entryPoint: `https://login.microsoftonline.com/${process.env.TENANT_ID}/saml2`,
    idpIssuer: `https://sts.windows.net/${process.env.TENANT_ID}/`,
    idpCert: process.env.IDP_CERT,
    issuer: process.env.ENTITY_ID,
    callbackUrl: process.env.ACS_URL,
    wantAuthnResponseSigned: false,
    wantAssertionsSigned: false,
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256",
  },
  (profile, done) => done(null, profile),
  (profile, done) => done(null, profile)
);

passport.use(samlStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const C = { primary: "#0f7938", dark: "#0a5a28", light: "#e8f5e9", red: "#c0392b" };

app.get("/", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/dashboard");
  res.send(`<!DOCTYPE html><html><head><title>HR Portal</title></head>
    <body style="font-family:sans-serif;background:#f5f5f5;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
      <div style="background:white;padding:56px 48px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.1);text-align:center;max-width:420px;width:100%">
        <div style="font-size:56px;margin-bottom:8px">👥</div>
        <h1 style="color:${C.primary};margin:12px 0 8px;font-size:28px">HR Portal</h1>
        <p style="color:#666;margin-bottom:36px">Employee records, onboarding &amp; payroll</p>
        <a href="/auth/saml" style="display:inline-block;background:${C.primary};color:white;padding:14px 36px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.3px">
          Sign in with Entra ID
        </a>
        <p style="color:#aaa;font-size:12px;margin-top:24px">Cavalry Tenant · Port 3001</p>
      </div>
    </body></html>`);
});

app.get("/auth/saml", passport.authenticate("saml", { failureRedirect: "/login-failed" }));

app.post("/auth/saml/callback",
  passport.authenticate("saml", { failureRedirect: "/login-failed" }),
  (req, res) => res.redirect("/dashboard")
);

app.get("/auth/saml/metadata", (req, res) => {
  res.type("application/xml");
  res.send(samlStrategy.generateServiceProviderMetadata(null, null));
});

app.get("/dashboard", requireAuth, (req, res) => {
  const name = req.user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
    || req.user.nameidentifier || "Employee";
  const email = req.user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
    || req.user.email || "—";
  const signedInAt = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const rows = Object.entries(req.user)
    .filter(([k]) => !k.startsWith("__") && k !== "issuer" && k !== "sessionIndex")
    .map(([k, v], i) => `
      <tr style="background:${i % 2 === 0 ? "white" : "#f9fafb"}">
        <td style="padding:11px 16px;font-size:13px;color:#666;font-family:monospace;border-bottom:1px solid #eee">${k.split("/").pop()}</td>
        <td style="padding:11px 16px;font-size:14px;border-bottom:1px solid #eee;word-break:break-all">${v}</td>
      </tr>`).join("");

  res.send(`<!DOCTYPE html><html><head><title>HR Portal — Dashboard</title></head>
    <body style="font-family:sans-serif;background:#f5f5f5;margin:0;min-height:100vh">

      <!-- Navbar -->
      <nav style="background:${C.primary};color:white;padding:0 32px;display:flex;justify-content:space-between;align-items:center;height:60px;box-shadow:0 2px 8px rgba(0,0,0,0.2)">
        <span style="font-size:20px;font-weight:700">👥 HR Portal</span>
        <div style="display:flex;align-items:center;gap:20px">
          <span style="font-size:14px;opacity:0.9">${email}</span>
          <a href="/logout" style="background:${C.red};color:white;padding:8px 18px;border-radius:5px;text-decoration:none;font-size:14px;font-weight:600">
            Sign Out
          </a>
        </div>
      </nav>

      <!-- Success Banner -->
      <div style="background:${C.dark};color:white;padding:32px 40px;text-align:center">
        <div style="font-size:48px;margin-bottom:8px">✅</div>
        <h2 style="margin:0 0 8px;font-size:24px">Sign In Successful</h2>
        <p style="margin:0;opacity:0.85;font-size:15px">
          Welcome, <strong>${name}</strong> — authenticated via Microsoft Entra ID at ${signedInAt}
        </p>
        <p style="margin:8px 0 0;opacity:0.65;font-size:13px">
          SAML 2.0 assertion verified &nbsp;·&nbsp; Session active
        </p>
      </div>

      <!-- Content -->
      <div style="padding:40px;max-width:920px;margin:0 auto">

        <!-- Info cards -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:36px">
          ${[
            ["Signed in as", name],
            ["Email", email],
            ["Identity Provider", "Microsoft Entra ID"],
          ].map(([label, val]) => `
            <div style="background:white;padding:20px 24px;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.07);border-top:3px solid ${C.primary}">
              <div style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">${label}</div>
              <div style="color:#222;font-size:15px;font-weight:600;word-break:break-all">${val}</div>
            </div>`).join("")}
        </div>

        <!-- Claims table -->
        <h3 style="color:#333;margin-bottom:12px;font-size:16px">SAML Claims received from Entra ID</h3>
        <div style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:${C.primary};color:white">
                <th style="padding:12px 16px;text-align:left;font-size:13px;width:40%">Claim</th>
                <th style="padding:12px 16px;text-align:left;font-size:13px">Value</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:32px">
          <p style="color:#aaa;font-size:12px;margin:0">HR Portal · Port 3001 · Entity ID: ${process.env.ENTITY_ID}</p>
          <a href="/logout" style="background:${C.red};color:white;padding:10px 24px;border-radius:5px;text-decoration:none;font-size:14px;font-weight:600">
            Sign Out
          </a>
        </div>
      </div>
    </body></html>`);
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => res.redirect("/"));
  });
});

app.get("/login-failed", (req, res) => {
  res.status(401).send(`<!DOCTYPE html><html><head><title>HR Portal — Login Failed</title></head>
    <body style="font-family:sans-serif;background:#f5f5f5;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
      <div style="background:white;padding:48px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.1);text-align:center;max-width:400px">
        <div style="font-size:48px">❌</div>
        <h2 style="color:${C.red};margin:16px 0 8px">Authentication Failed</h2>
        <p style="color:#666;margin-bottom:28px">Entra ID could not verify your identity.</p>
        <a href="/" style="background:${C.primary};color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600">Try Again</a>
      </div>
    </body></html>`);
});

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth/saml");
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`cavalry-hr-portal  →  http://localhost:${PORT}`));
