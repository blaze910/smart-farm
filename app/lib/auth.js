const USERS_KEY = "smartfarm_users";
const SESSION_KEY = "smartfarm_session";
const OTP_DATA_KEY = "smartfarm_otp_data";
const OTP_REQUESTS_KEY = "smartfarm_otp_requests";
const PASSWORD_RESET_SESSION_KEY = "smartfarm_password_reset";
const REQUEST_WINDOW_MS = 15 * 60 * 1000;
const MAX_OTP_REQUESTS = 3;
const OTP_EXPIRATION_MS = 3 * 60 * 1000;
const RESET_CODE_TIMEOUT_MS = 1 * 60 * 1000;



function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function loadUsers() {
  const storage = getStorage();
  if (!storage) return [];

  try {
    return JSON.parse(storage.getItem(USERS_KEY) ?? "[]") || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(session) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getOtpData() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return JSON.parse(storage.getItem(OTP_DATA_KEY) ?? "null");
  } catch {
    return null;
  }
}

function setOtpData(data) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(OTP_DATA_KEY, JSON.stringify(data));
}

function removeOtpData() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(OTP_DATA_KEY);
}

function getOtpRequests() {
  const storage = getStorage();
  if (!storage) return {};

  try {
    return JSON.parse(storage.getItem(OTP_REQUESTS_KEY) ?? "{}") || {};
  } catch {
    return {};
  }
}

function setOtpRequests(requests) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(OTP_REQUESTS_KEY, JSON.stringify(requests));
}

function getPasswordResetSession() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return JSON.parse(storage.getItem(PASSWORD_RESET_SESSION_KEY) ?? "null");
  } catch {
    return null;
  }
}

function setPasswordResetSession(session) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(PASSWORD_RESET_SESSION_KEY, JSON.stringify(session));
}

function clearPasswordResetSession() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(PASSWORD_RESET_SESSION_KEY);
}

function encodeUtf8(text) {
  return new TextEncoder().encode(text);
}

async function hashText(text) {
  const digest = await crypto.subtle.digest("SHA-256", encodeUtf8(text));
  const bytes = new Uint8Array(digest);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function normalizeEmail(email) {
  return (email || "").toString().toLowerCase().trim();
}

function generateOtpCode() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
}

async function hashPassword(password) {
  return hashText(password);
}

async function isPasswordMatch(storedPassword, candidatePassword) {
  const hashedCandidate = await hashPassword(candidatePassword);
  return storedPassword === hashedCandidate || storedPassword === candidatePassword;
}

function generateToken(email) {
  return btoa(`${email}:${Date.now()}`);
}

export async function registerUser({ name, email, password }) {
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return { success: false, message: "All fields are required." };
  }

  if (password.length < 6 || password.length > 16) {
    return { success: false, message: "Password must be between 6 and 16 characters." };
  }

  const normalizedName = name.trim();
  const normalizedUsername = normalizedName.toLowerCase().replace(/\s+/g, "");
  const normalizedEmail = email.toLowerCase().trim();
  const users = loadUsers();
  const existingUsername = users.find((user) => user.username === normalizedUsername);
  const existingEmail = users.find(
    (user) => user.email && user.email.toLowerCase().trim() === normalizedEmail
  );

  if (existingUsername && existingEmail) {
    return { success: false, message: "This username and email is already registered." };
  }

  if (existingUsername) {
    return { success: false, message: "This username is already registered." };
  }

  if (existingEmail) {
    return { success: false, message: "This email is already registered." };
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    name: normalizedName,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
  };

  users.push(newUser);
  saveUsers(users);
  setSession({ name: newUser.name, username: newUser.username, email: newUser.email, token: generateToken(newUser.username), isNew: true });

  return { success: true, message: "Account created successfully.", user: newUser };
}

export async function loginUser({ identifier, password }) {
  if (!identifier?.trim() || !password?.trim()) {
    return { success: false, message: "Identifier and password are required." };
  }

  const normalizedIdentifier = identifier.toLowerCase().trim();
  const users = loadUsers();
  const matchedUser = users.find((user) => {
    const hasEmail = typeof user.email === "string" && user.email.trim().length > 0;
    return (
      user.username === normalizedIdentifier ||
      user.name.toLowerCase().trim() === normalizedIdentifier ||
      (hasEmail && user.email.toLowerCase().trim() === normalizedIdentifier)
    );
  });

  if (!matchedUser) {
    return { success: false, message: "Invalid identifier or password.", shouldRedirect: true };
  }

  const passwordMatches = await isPasswordMatch(matchedUser.password, password);
  if (!passwordMatches) {
    return { success: false, message: "Wrong password.", shouldRedirect: false };
  }

  setSession({
    name: matchedUser.name,
    username: matchedUser.username,
    email: matchedUser.email ?? "",
    token: generateToken(matchedUser.username),
    isNew: false,
  });

  return { success: true, message: "Login successful.", user: matchedUser };
}

export async function sendPasswordResetOtp(email) {
  const normalizedEmail = normalizeEmail(email);
  const users = loadUsers();
  const user = users.find((item) => item.email === normalizedEmail);
  const now = Date.now();
  const requests = getOtpRequests();
  const existingRequests = requests[normalizedEmail] || [];
  const recent = existingRequests.filter((timestamp) => now - timestamp <= REQUEST_WINDOW_MS);

  if (!user) {
    return { success: false, message: "No account is registered with that email." };
  }

  const response = { success: true, message: "Verification code sent, please check your email." };

  if (recent.length < MAX_OTP_REQUESTS) {
    recent.push(now);
    requests[normalizedEmail] = recent;
    setOtpRequests(requests);
  }

  if (recent.length <= MAX_OTP_REQUESTS) {
    const otp = generateOtpCode();
    const otpHash = await hashText(otp);
    setOtpData({
      email: normalizedEmail,
      otpHash,
      expiresAt: now + OTP_EXPIRATION_MS,
      createdAt: now,
    });

    try {
      const emailResponse = await fetch("/api/email/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, otp }),
      });

      const emailResult = await emailResponse.json().catch(() => null);
      if (!emailResponse.ok) {
        console.error("Email API failed:", emailResult || { status: emailResponse.status });
        response.success = false;
        response.message = emailResult?.message || "Unable to send verification code.";
      }
    } catch (error) {
      console.error("Email send failed:", error);
      response.success = false;
      response.message = "Unable to send verification code.";
    }
  }

  return response;
}

export async function verifyPasswordResetOtp({ email, code }) {
  const normalizedEmail = normalizeEmail(email);
  const otpData = getOtpData();
  const now = Date.now();

  if (!otpData || otpData.email !== normalizedEmail || otpData.expiresAt < now) {
    return { success: false, message: "Invalid or expired code." };
  }

  const codeHash = await hashText(code);
  if (codeHash !== otpData.otpHash) {
    return { success: false, message: "Invalid or expired code." };
  }

  removeOtpData();
  setPasswordResetSession({ email: normalizedEmail, verifiedAt: now, expiresAt: now + RESET_CODE_TIMEOUT_MS });
  return { success: true };
}

export async function resetPassword({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const session = getPasswordResetSession();

  if (!session || session.email !== normalizedEmail || session.expiresAt < Date.now()) {
    return { success: false, message: "Reset session invalid or expired." };
  }

  const users = loadUsers();
  const userIndex = users.findIndex((item) => item.email === normalizedEmail);
  if (userIndex === -1) {
    return { success: false, message: "Unable to reset password." };
  }

  users[userIndex].password = await hashPassword(password);
  saveUsers(users);
  clearPasswordResetSession();
  removeOtpData();

  return { success: true, message: "Password updated successfully." };
}

export function markUserAsReturning(user) {
  const storage = getStorage();
  if (!storage || !user) return user;
  const returningUser = { ...user, isNew: false };
  storage.setItem(SESSION_KEY, JSON.stringify(returningUser));
  return returningUser;
}

export function logout() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return JSON.parse(storage.getItem(SESSION_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function getResetSession() {
  return getPasswordResetSession();
}
