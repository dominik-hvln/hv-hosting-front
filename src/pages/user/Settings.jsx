import React, { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";

const [qrCode, setQrCode] = useState(null);
const [twoFactorCode, setTwoFactorCode] = useState("");

const Settings = () => {
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState({
        marketing: false,
        ecoMode: false,
        notifications: true,
        autoRenewal: false,
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        repeatPassword: "",
    });

    const [enable2FA, setEnable2FA] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserData = async () => {
        try {
            const res = await axios.get("/api/account");
            setUser(res.data);
            // opcjonalnie: setPreferences(res.data.preferences);
        } catch (err) {
            toast.error("Błąd ładowania danych użytkownika");
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleChangePassword = async () => {
        if (passwords.newPassword !== passwords.repeatPassword) {
            toast.error("Hasła nie są zgodne");
            return;
        }

        try {
            await axios.post("/api/change-password", passwords);
            toast.success("Hasło zostało zmienione");
            setPasswords({ currentPassword: "", newPassword: "", repeatPassword: "" });
        } catch (err) {
            toast.error("Błąd podczas zmiany hasła");
        }
    };

    const handleSavePreferences = async () => {
        try {
            await axios.post("/api/preferences", preferences);
            toast.success("Zapisano ustawienia");
        } catch (err) {
            toast.error("Błąd zapisu preferencji");
        }
    };

    const handleToggle2FA = async () => {
        if (enable2FA) {
            try {
                await axios.post("/api/2fa/disable");
                toast.success("2FA wyłączone");
                setEnable2FA(false);
                setQrCode(null);
            } catch (err) {
                toast.error("Błąd wyłączania 2FA");
            }
        } else {
            try {
                const res = await axios.post("/api/2fa/enable");
                setQrCode(res.data.qr);
                setEnable2FA(true);
                toast("Skanuj kod QR i potwierdź");
            } catch (err) {
                toast.error("Błąd aktywacji 2FA");
            }
        }
    };

    const confirm2FA = async () => {
        try {
            await axios.post("/api/2fa/confirm", { code: twoFactorCode });
            toast.success("2FA potwierdzone");
            setTwoFactorCode("");
            setQrCode(null);
        } catch (err) {
            toast.error("Nieprawidłowy kod 2FA");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 space-y-6">
            <h1 className="text-xl font-bold">Ustawienia konta</h1>

            <div className="bg-white rounded-xl p-4 shadow">
                <h2 className="font-semibold mb-2">Zmiana hasła</h2>
                <input
                    type="password"
                    placeholder="Obecne hasło"
                    className="input mb-2"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Nowe hasło"
                    className="input mb-2"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Powtórz nowe hasło"
                    className="input mb-2"
                    value={passwords.repeatPassword}
                    onChange={(e) => setPasswords({ ...passwords, repeatPassword: e.target.value })}
                />
                <button className="btn btn-primary" onClick={handleChangePassword}>
                    Zmień hasło
                </button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
                <h2 className="font-semibold mb-2">Ustawienia użytkownika</h2>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    />
                    <span>Zgoda marketingowa</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={preferences.ecoMode}
                        onChange={(e) => setPreferences({ ...preferences, ecoMode: e.target.checked })}
                    />
                    <span>Tryb EKO</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                    />
                    <span>Powiadomienia email</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={preferences.autoRenewal}
                        onChange={(e) => setPreferences({ ...preferences, autoRenewal: e.target.checked })}
                    />
                    <span>Automatyczne odnawianie usług</span>
                </label>
                <button className="btn btn-secondary mt-3" onClick={handleSavePreferences}>
                    Zapisz ustawienia
                </button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
                <h2 className="font-semibold mb-2">Uwierzytelnianie dwuetapowe (2FA)</h2>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={enable2FA}
                        onChange={handleToggle2FA}
                    />
                    <span>Włącz 2FA</span>
                </label>

                {qrCode && (
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">Skanuj poniższy kod QR:</p>
                        <img src={qrCode} alt="2FA QR" className="w-40" />
                        <input
                            type="text"
                            className="input"
                            placeholder="Kod z aplikacji"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={confirm2FA}>
                            Potwierdź kod
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
