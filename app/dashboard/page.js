"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAccount, getCurrentUser, logout, markUserAsReturning, updateUserPassword, updateUserProfile } from "../lib/auth";

// Using componentized DataCard and SummaryList from /components

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [activePanel, setActivePanel] = useState("dashboard");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswordFields, setShowPasswordFields] = useState({ current: false, new: false, confirm: false });
  const [statusMessage, setStatusMessage] = useState("Use the sidebar to update your account and preferences.");
  const [location, setLocation] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("Enter a location and tap run to load live farming insights.");
  const [cropData, setCropData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [pestData, setPestData] = useState(null);
  const [plantingSuggestions, setPlantingSuggestions] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [rainfallData, setRainfallData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    setUser(currentUser);
    setProfileName(currentUser.name || "");
    setProfileImage(currentUser.avatar || "");
    if (currentUser.isNew) {
      markUserAsReturning(currentUser);
    }
  }, [router]);


  const handleSignOut = () => {
    setIsSidebarOpen(false);
    logout();
    router.push("/login");
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      setStatusMessage("Profile image uploaded");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      setStatusMessage("Please enter a username before saving.");
      return;
    }

    const result = await updateUserProfile({
      email: user.email,
      name: profileName.trim(),
      avatar: profileImage || user.avatar || "",
    });

    if (!result.success) {
      setStatusMessage(result.message || "Unable to update profile.");
      return;
    }

    setUser((prev) => ({ ...prev, name: profileName.trim(), avatar: profileImage || prev.avatar || "" }));
    setStatusMessage("Profile updated");
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setStatusMessage("Fill in all password fields to continue.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMessage("New password and confirmation do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setStatusMessage("New password should be at least 6 characters long.");
      return;
    }

    const result = await updateUserPassword({
      email: user.email,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    setStatusMessage(result.message || "Password update failed.");
    if (result.success) {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm("This will remove your account from this demo session. Continue?");
    if (!confirmed) return;

    deleteUserAccount(user.email);
    setStatusMessage("Account deleted from this session.");
    router.push("/login");
  };

  const renderWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "rain":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 13a4 4 0 0 0-8 0" />
            <path d="M6 13h12" />
            <path d="M8 18l1.5-3 1.5 3" />
            <path d="M14 18l1.5-3 1.5 3" />
          </svg>
        );
      case "clouds":
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 16a4 4 0 0 1 0-8 5 5 0 0 1 9.9 1.4A3.5 3.5 0 0 1 19 15h-1" />
            <path d="M3 16h16" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v3" />
            <path d="M12 20v3" />
            <path d="M4.22 4.22l2.12 2.12" />
            <path d="M17.66 17.66l2.12 2.12" />
            <path d="M1 12h3" />
            <path d="M20 12h3" />
            <path d="M4.22 19.78l2.12-2.12" />
            <path d="M17.66 6.34l2.12-2.12" />
          </svg>
        );
    }
  };

  const maxWeatherTemp = weatherData?.reduce((max, item) => Math.max(max, item.maxTemp), 0) || 1;

  const loadInsights = async (searchLocation) => {
    const locationValue = searchLocation.trim() || location.trim();
    if (!locationValue) {
      setErrors({ location: "Enter a location to continue." });
      return;
    }

    setLoading(true);
    setErrors({});
    setStatusText(`Loading insights for ${locationValue}...`);

    try {
      const response = await fetch(`/api/dashboard/insights?location=${encodeURIComponent(locationValue)}`);
      if (!response.ok) {
        throw new Error("Failed to load data.");
      }

      const result = await response.json();
      setCropData(result.cropRecommendations);
      setPlantingSuggestions(result.plantingSuggestions);
      setSoilData(result.soilData);
      setRainfallData(result.rainfallData);
      setWeatherData(result.weatherData);
      setMarketData(result.marketData);
      setPestData(result.pestData);
      setActiveLocation(result.location);
      setStatusText(`Insights loaded for ${result.location}.`);
    } catch (error) {
      setStatusText("Unable to load insights. Please try again.");
      setErrors({ api: error.message || "Unable to load insights." });
      setCropData(null);
      setSoilData(null);
      setRainfallData(null);
      setWeatherData(null);
      setMarketData(null);
      setPestData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    await loadInsights(location);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswordFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-white text-slate-950">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl">
            <p className="text-sm text-slate-600">Checking session...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f8fff7_0%,#ffffff_45%,#f4fbff_100%)] text-slate-950">
      <div className="fixed left-4 top-4 z-40 xl:left-6 xl:top-6">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-[0_15px_30px_-15px_rgba(0,0,0,0.35)] backdrop-blur"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
      </div>

      {isSidebarOpen ? (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/35"
        />
      ) : null}

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-4 pt-16 sm:px-6 lg:py-8 xl:flex-row xl:px-8 xl:pt-8">
        <aside className={`fixed inset-y-0 left-0 z-40 w-[88vw] max-w-xs -translate-x-full overflow-y-auto rounded-r-[2rem] border border-slate-200 bg-white/95 p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] backdrop-blur transition-transform duration-300 xl:fixed xl:left-0 xl:top-0 xl:h-screen xl:w-[22rem] xl:max-w-none xl:-translate-x-full xl:rounded-none xl:border-r xl:border-slate-200 xl:bg-white/95 xl:p-5 ${isSidebarOpen ? "translate-x-0 xl:translate-x-0" : ""}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-[#31572C]">Menu</p>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700"
            >
              ×
            </button>
          </div>
          <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#31572C_0%,#4f772d_100%)] p-4 text-white shadow-lg">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-emerald-100">FarmPulse</p>
            
          </div>

          <div className="mt-5 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <label className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white bg-white shadow-md ring-1 ring-slate-200 transition hover:scale-105 hover:ring-[#31572C]/40">
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                {profileImage ? (
                  <img src={profileImage} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#31572C]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    <path d="M4 20a8 8 0 1 1 16 0" />
                  </svg>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#31572C] text-base font-semibold text-white shadow-lg">+</span>
              </label>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{profileName || user.name}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-[#31572C]">Public profile</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Tap the avatar to add a photo.</p>
          </div>

          <nav className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { key: "profile", label: "Profile", description: "Upload profile" },
              { key: "settings", label: "Settings", description: "Account settings" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActivePanel(item.key);
                }}
                className="rounded-[1.2rem] border border-transparent bg-slate-50 px-4 py-3 text-left transition hover:border-slate-200 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
              </button>
            ))}
          </nav>

          <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.35em] text-[#31572C]">Status</p>
            <p className="mt-2 text-slate-700">{statusMessage}</p>
          </div>

          <div className="mt-5 space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            {activePanel === "profile" ? (
              <>
                <p className="text-xs uppercase tracking-[0.35em] text-[#31572C]">Profile</p>
                <div className="rounded-[1.2rem] bg-white p-3 shadow-sm text-sm text-slate-600">
                  Update your profile
                </div>
                <label className="block cursor-pointer rounded-[1.2rem] border border-dashed border-[#31572C]/40 bg-white p-4 text-center text-sm text-slate-600 transition hover:border-[#31572C] hover:bg-[#31572C]/5">
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                  Upload profile image
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Username 
                  <input
                    type="text"
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-[#31572C] focus:ring-2 focus:ring-[#31572C]/15"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="w-full rounded-full bg-[#31572C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#214c1f]"
                >
                  Save profile
                </button>
              </>
            ) : null}

            {activePanel === "settings" ? (
              <>
                <p className="text-xs uppercase tracking-[0.35em] text-[#31572C]">Settings</p>
                <div className="rounded-[1.2rem] bg-white p-3 shadow-sm text-sm text-slate-600">
                  Your password update is stored in the demo account system, and deleting your account clears the local session.
                </div>
                <label className="space-y-1 text-sm text-slate-600">
                  Current password
                  <div className="relative">
                    <input
                      type={showPasswordFields.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 pr-11 text-sm text-slate-950 outline-none focus:border-[#31572C] focus:ring-2 focus:ring-[#31572C]/15"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      aria-label={showPasswordFields.current ? "Hide current password" : "Show current password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-[#31572C]"
                    >
                      {showPasswordFields.current ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
                          <path d="M9.9 5.1A10.8 10.8 0 0 1 12 4.5c7 0 10 7.5 10 7.5a18.6 18.6 0 0 1-4.5 5.1" />
                          <path d="M6.3 6.3A18.9 18.9 0 0 0 2 12s3 7.5 10 7.5a10.8 10.8 0 0 0 3.7-.6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  New password
                  <div className="relative">
                    <input
                      type={showPasswordFields.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 pr-11 text-sm text-slate-950 outline-none focus:border-[#31572C] focus:ring-2 focus:ring-[#31572C]/15"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      aria-label={showPasswordFields.new ? "Hide new password" : "Show new password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-[#31572C]"
                    >
                      {showPasswordFields.new ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
                          <path d="M9.9 5.1A10.8 10.8 0 0 1 12 4.5c7 0 10 7.5 10 7.5a18.6 18.6 0 0 1-4.5 5.1" />
                          <path d="M6.3 6.3A18.9 18.9 0 0 0 2 12s3 7.5 10 7.5a10.8 10.8 0 0 0 3.7-.6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Confirm password
                  <div className="relative">
                    <input
                      type={showPasswordFields.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 pr-11 text-sm text-slate-950 outline-none focus:border-[#31572C] focus:ring-2 focus:ring-[#31572C]/15"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      aria-label={showPasswordFields.confirm ? "Hide confirmation password" : "Show confirmation password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-[#31572C]"
                    >
                      {showPasswordFields.confirm ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
                          <path d="M9.9 5.1A10.8 10.8 0 0 1 12 4.5c7 0 10 7.5 10 7.5a18.6 18.6 0 0 1-4.5 5.1" />
                          <path d="M6.3 6.3A18.9 18.9 0 0 0 2 12s3 7.5 10 7.5a10.8 10.8 0 0 0 3.7-.6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  className="w-full rounded-full bg-[#31572C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#214c1f]"
                >
                  Change password
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Delete account
                </button>
              </>
            ) : null}

          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-5 inline-flex items-center justify-center rounded-full border border-[#31572C]/30 bg-[#31572C] px-4 py-3 text-sm font-semibold text-[#F8F9FA] transition hover:bg-[#214c1f]"
          >
            Logout
          </button>
        </aside>

        <section className="flex-1">
          <header className="flex flex-col gap-6 rounded-[2.5rem] border border-slate-200 bg-white/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.05)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-[#31572C]">FarmPulse</p>
                <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
                  {user.isNew ? `Welcome, ${profileName || user.name}` : `Good day, ${profileName || user.name}`}
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open profile sidebar"
                className="inline-flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-[0_18px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-slate-200 sm:h-20 sm:w-20"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-9 w-9 text-[#31572C]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    <path d="M4 20a8 8 0 1 1 16 0" />
                  </svg>
                )}
              </button>
            </div>

            <div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Explore crop recommendations, weather forecasts, market pricing, and pest alerts across your chosen farming location.
              </p>
            </div>
          </header>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.05)] sm:p-8">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[#31572C]">Location</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-950">{activeLocation || "No location selected"}</h2>
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {loading ? "Refreshing data..." : statusText}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600">
                  Search by location
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="e.g. Abuja, Kaduna, Oyo"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-[#31572C] focus:ring-2 focus:ring-[#31572C]/15"
                  />
                  {errors.location ? <span className="text-xs text-rose-500">{errors.location}</span> : null}
                </label>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={loading}
                    className="inline-flex h-full items-center justify-center rounded-full bg-[#31572C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#214c1f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Run Insights"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-[#31572C]">Crop suitability</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">Recommended crops</h3>
                <div className="mt-4 space-y-3">
                  {cropData?.map((item, index) => (
                    <div key={index} className="rounded-3xl bg-white p-4 shadow-sm">
                      <p className="font-semibold text-slate-950">{item.crop}</p>
                      <p className="mt-1 text-sm text-slate-600">Suitability: {item.suitability}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
                    </div>
                  )) || <p className="text-sm text-slate-500">Run insights to show crop recommendations.</p>}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-[#31572C]">Soil status</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">Soil health snapshot</h3>
                {soilData ? (
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between rounded-3xl bg-white p-4">
                      <span>Moisture</span>
                      <span>{soilData.moisture}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-3xl bg-white p-4">
                      <span>pH level</span>
                      <span>{soilData.ph}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-3xl bg-white p-4">
                      <span>Nitrogen</span>
                      <span>{soilData.nitrogen}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-3xl bg-white p-4">
                      <span>Phosphorus</span>
                      <span>{soilData.phosphorus}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-3xl bg-white p-4">
                      <span>Potassium</span>
                      <span>{soilData.potassium}</span>
                    </div>
                    <p className="rounded-3xl bg-slate-100 p-4 text-sm text-slate-600">{soilData.recommendation}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">Run insights to show soil analysis.</p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#31572C]">Planting suggestions</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-950">Where, and when to plant</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {plantingSuggestions?.map((item, index) => (
                  <div key={index} className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-950">{item.crop}</p>
                    <p className="mt-1 text-sm text-slate-600">When: {item.when}</p>
                    <p className="mt-1 text-sm text-slate-600">Where: {item.where}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                  </div>
                )) || <p className="text-sm text-slate-500">Run insights to show planting recommendations.</p>}
              </div>
            </div>
          </div>

          <aside className="space-y-6 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.05)] sm:p-8">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#31572C]">Weather</p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">7-day forecast</h3>
                </div>
                <span className="rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Daily
                </span>
              </div>

              {weatherData ? (
                <>
                  <div className="mt-5 overflow-x-auto pb-3">
                    <div className="flex gap-3 min-w-[max-content]">
                      {weatherData.map((item, index) => (
                        <div key={index} className="flex min-w-[5.5rem] flex-col items-center gap-3">
                          <span className="text-xs font-semibold text-slate-700">{item.day}</span>
                          <div className="flex h-32 w-full items-end justify-center">
                            <div
                              className="relative flex w-full items-end justify-center"
                              style={{ height: "100%" }}
                            >
                              <div
                                className="w-full rounded-full bg-emerald-400/90"
                                style={{ height: `${Math.max(14, (item.maxTemp / maxWeatherTemp) * 100)}%` }}
                              />
                              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-slate-200" />
                            </div>
                          </div>
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm">
                            {renderWeatherIcon(item.condition)}
                          </div>
                          <span className="text-[0.72rem] text-slate-600">{item.maxTemp}°/{item.minTemp}°</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Highest temp</p>
                      <p className="mt-2 text-slate-950 font-semibold">{Math.max(...weatherData.map((item) => item.maxTemp))}°C</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Rain chance</p>
                      <p className="mt-2 text-slate-950 font-semibold">{Math.max(...weatherData.map((item) => item.pop))}%</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-slate-500">Run insights to view the weather forecast.</p>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#31572C]">Market prices</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-950">Live crop rates</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {marketData?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-3xl bg-white p-4">
                    <div>
                      <p className="font-semibold text-slate-950">{item.product}</p>
                      <p className="text-slate-500">{item.change} since last update</p>
                    </div>
                    <span className="font-semibold text-slate-950">{item.price}</span>
                  </div>
                )) || <p className="text-slate-500">Run insights to load market prices.</p>}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#31572C]">Pest alerts</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-950">Field warnings</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {pestData?.map((item, index) => (
                  <div key={index} className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-950">{item.type}</p>
                    <p className="mt-1 text-slate-500">Severity: {item.severity}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.message}</p>
                  </div>
                )) || <p className="text-slate-500">Run insights to receive pest alerts.</p>}
              </div>
            </div>
          </aside>
        </section>

          {errors.api ? (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
              {errors.api}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
