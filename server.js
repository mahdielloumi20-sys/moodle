const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const PORT = 3001;
const ROOT = __dirname;

function parseEnvFile(contents) {
  const env = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

async function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  try {
    const contents = await fs.readFile(envPath, "utf8");
    const parsed = parseEnvFile(contents);
    return {
      SUPABASE_URL: process.env.SUPABASE_URL || parsed.SUPABASE_URL || "",
      SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || parsed.SUPABASE_PUBLISHABLE_KEY || ""
    };
  } catch {
    return {
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || ""
    };
  }
}

function sendJson(res, status, payload, origin = "*") {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey"
  });
  res.end(JSON.stringify(payload));
}

async function fetchSupabaseLogin({ supabaseUrl, supabaseKey, email, password }) {
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const authPayload = await authResponse.json().catch(() => ({}));
  if (!authResponse.ok) {
    throw new Error(authPayload.error_description || authPayload.msg || authPayload.message || "Connexion refusée par Supabase.");
  }

  const accessToken = authPayload.access_token;
  const user = authPayload.user;
  if (!accessToken || !user) {
    throw new Error("Réponse Supabase incomplète.");
  }

  const profileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?select=id,email,first_name,last_name,role&id=eq.${encodeURIComponent(user.id)}&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  const profilePayload = await profileResponse.json().catch(() => []);
  const profile = Array.isArray(profilePayload) ? profilePayload[0] : null;

  return {
    user,
    profile,
    access_token: accessToken,
    refresh_token: authPayload.refresh_token || "",
    role: profile?.role || user?.user_metadata?.role || "participant"
  };
}

async function main() {
  const env = await loadEnv();
  const supabaseUrl = String(env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const supabaseKey = String(env.SUPABASE_PUBLISHABLE_KEY || "").trim();

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase config missing. Check .env");
  }

  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin === "http://127.0.0.1:5500" ? req.headers.origin : "http://127.0.0.1:5500";

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey"
      });
      res.end();
      return;
    }

    if (req.url === "/api/login" && req.method === "POST") {
      if (!supabaseUrl || !supabaseKey) {
        sendJson(res, 500, { error: "Configuration Supabase manquante." }, origin);
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const parsed = JSON.parse(body || "{}");
          const email = String(parsed.email || "").trim().toLowerCase();
          const password = String(parsed.password || "");

          if (!email || !password) {
            sendJson(res, 400, { error: "Adresse e-mail et mot de passe obligatoires." }, origin);
            return;
          }

          const result = await fetchSupabaseLogin({
            supabaseUrl,
            supabaseKey,
            email,
            password
          });

          sendJson(res, 200, result, origin);
        } catch (error) {
          sendJson(res, 401, { error: error?.message || "Échec de connexion." }, origin);
        }
      });
      return;
    }

    sendJson(res, 404, { error: "Not found" }, origin);
  });

  server.listen(PORT, "127.0.0.1", () => {
    console.log(`Auth proxy ready on http://127.0.0.1:${PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
