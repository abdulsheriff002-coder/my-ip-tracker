import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Home,
  Clock,
  User,
  LogOut,
  Globe,
  MapPin,
  Server,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";


/* Fix default marker icon in Leaflet */
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/* ================= TYPES ================= */
type Tab = "dashboard" | "history" | "profile";

interface IPInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  type: "Public" | "Private";
  latitude?: number;
  longitude?: number;
}

interface StoredUser {
  email: string;
}

/* ================= COMPONENT ================= */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [inputIp, setInputIp] = useState("");
  const [currentIP, setCurrentIP] = useState<IPInfo | null>(null);
  const [history, setHistory] = useState<IPInfo[]>([]);

  const [user] = useState<StoredUser | null>(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.email ? { email: parsed.email } : null;
    } catch {
      return null;
    }
  });

  const isPrivateIP = (ip: string): boolean =>
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);

  const fetchIPInfo = useCallback(async (ip?: string) => {
    try {
      const url = ip ? `https://ipwhois.app/json/${ip}` : "https://ipwhois.app/json/";
      const res = await axios.get(url);

      const data: IPInfo = {
        ip: res.data.ip,
        city: res.data.city,
        region: res.data.region,
        country: res.data.country,
        isp: res.data.isp,
        type: isPrivateIP(res.data.ip) ? "Private" : "Public",
        latitude: res.data.latitude,
        longitude: res.data.longitude,
      };

      setCurrentIP(data);
      setHistory((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Failed to fetch IP info:", err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchIPInfo();
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchIPInfo]);

  const handleSearch = () => {
    if (!inputIp.trim()) return;
    fetchIPInfo(inputIp.trim());
    setInputIp("");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-8">IP Tracker</h1>

        {(
          [
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "history", label: "History", icon: Clock },
            { id: "profile", label: "Profile", icon: User },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg mb-2 ${
              activeTab === id
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex gap-3 max-w-xl mb-6">
              <Globe className="text-blue-500" size={24} />
              <input
                value={inputIp}
                onChange={(e) => setInputIp(e.target.value)}
                placeholder="Enter IP address"
                className="flex-1 border px-4 py-3 rounded-lg"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 rounded-lg font-semibold"
              >
                Track
              </button>
            </div>

            {currentIP && (
              <div className="bg-white p-6 rounded-xl shadow space-y-2 max-w-lg">
                <p><strong>IP:</strong> {currentIP.ip}</p>
                <p>
                  <strong>Type:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentIP.type === "Private"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {currentIP.type}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} /> {currentIP.city}, {currentIP.region}
                </p>
                <p className="flex items-center gap-2">
                  <Server size={16} /> {currentIP.country}
                </p>
                <p><strong>ISP:</strong> {currentIP.isp}</p>

                {/* MAP */}
                {currentIP.type === "Public" && currentIP.latitude && currentIP.longitude ? (
                  <MapContainer
                    center={[currentIP.latitude, currentIP.longitude] as LatLngExpression}
                    zoom={10}
                    style={{ height: "300px", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[currentIP.latitude, currentIP.longitude] as LatLngExpression}>
                      <Popup>
                        {currentIP.city}, {currentIP.region}, {currentIP.country}
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <p className="text-red-500">Cannot display map for private IP.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-3 max-w-lg">
            {history.length === 0 && <p className="text-gray-500">No history yet.</p>}
            {history.map((h, i) => (
              <div key={i} className="bg-white p-4 rounded shadow">
                {h.ip} — {h.type} <br />
                <span className="text-gray-500 text-sm">
                  {h.city}, {h.region}, {h.country}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded-xl shadow max-w-md space-y-3">
            <p><strong>Email:</strong> {user?.email ?? "N/A"}</p>
            <p><strong>Status:</strong> Logged In</p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-600 text-white w-full py-3 rounded-lg flex justify-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
