import "./account.css";
import { useState, useEffect } from "react";
import PasswordStrengthPopup from "../password_strenght/PasswordStrengthPopup";
import { getPasswordInfo } from "../password_strenght/passwordStrength";

type User = {
    userId: number;
    name: string;
    surname: string;
    email: string;
    passwordChangedAt: string;
    passwordNextChangeAt: string;
    daysToPasswordChange: number;
    passwordChangeRequired: boolean;
};

export default function Account() {
    const [editProfile, setEditProfile] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [user, setUser] = useState<User | null>(null);
    const [showPasswordInfo, setShowPasswordInfo] = useState(false);

    const [profileForm, setProfileForm] = useState({name: "", surname: "", email: ""});
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        repeatNewPassword: ""
    });

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const res = await fetch("/api/me", {
                credentials: "include"
            });

            if (!res.ok) {
                setProfileError("Nie jesteś zalogowana albo sesja wygasła.");
                return;
            }

            const data = await res.json();

            setUser(data);

            setProfileForm({
                name: data.name,
                surname: data.surname,
                email: data.email
            });

            setProfileError("");
        } catch (err) {
            console.error("Nie udało się pobrać danych profilu", err);
            setProfileError("Nie udało się pobrać danych profilu.");
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveProfile = async () => {
        try {
            const res = await fetch("/api/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(profileForm)
            });

            if (!res.ok) {
                const message = await res.text();
                setProfileError(message);
                return;
            }

            const saved = await res.json();

            setUser(saved);
            setEditProfile(false);
            setProfileError("");
            setPasswordError("");

        } catch (err) {
            console.error("Nie udało się zapisać profilu", err);
            setProfileError("Nie udało się zapisać profilu.");
        }
    };

    const cancelEdit = () => {
        if (!user) return;

        setProfileForm({
            name: user.name,
            surname: user.surname,
            email: user.email
        });

        setEditProfile(false);
        setProfileError("");
    };

    const cancelPasswordEdit = () => {
        setShowPasswordChange(false);
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            repeatNewPassword: ""
        });
        setPasswordError("");
        setShowPasswordInfo(false);
    };

    const changePassword = async () => {
        if (
             !passwordForm.currentPassword ||
             !passwordForm.newPassword ||
             !passwordForm.repeatNewPassword
        ) {
            setPasswordError("Uzupełnij wszystkie pola");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.repeatNewPassword) {
            setPasswordError("Nowe hasła się nie zgadzają");
            return;
        }

        try {
            const res = await fetch("/api/me/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(passwordForm)
            });

            if (!res.ok) {
                const message = await res.text();
                setPasswordError(message);
                return;
            }

            const saved = await res.json();

            setUser(saved);

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                repeatNewPassword: ""
            });

            setShowPasswordChange(false);
            setPasswordError("");

        } catch (err) {
            console.error("Nie udało się zmienić hasła", err);
            setPasswordError("Nie udało się zmienić hasła.");
        }
    };

    if (!user) {
        return (
            <section className="profile-section">
                <h2>👤 Mój profil</h2>

                {profileError && (
                    <p className="error">
                        {profileError}
                    </p>
                )}
            </section>
        );
    }

    return (
        <section className="profile-section">

            <h2>👤 Mój profil</h2>

            {profileError && (
                <p className="error">
                    {profileError}
                </p>
            )}

            {editProfile ? (
                <>
                    <div className="profile-form">

                        <label>
                            Imię
                            <input
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileChange}
                            />
                        </label>

                        <label>
                            Nazwisko
                            <input
                                name="surname"
                                value={profileForm.surname}
                                onChange={handleProfileChange}
                            />
                        </label>

                        <label>
                            Email
                            <input
                                name="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                            />
                        </label>

                    </div>

                    <div className="profile-actions">

                        <button onClick={saveProfile}>
                            Zapisz
                        </button>

                        <button
                            className="danger"
                            onClick={cancelEdit}
                        >
                            Anuluj
                        </button>

                    </div>
                </>
            ) : showPasswordChange ? (
                <div className="profile-form password-change-box">

                    <h3>Zmiana hasła do menadżera</h3>

                    {passwordError && (
                        <p className="error password-change-error">
                            {passwordError}
                        </p>
                    )}

                    <label>
                        Aktualne hasło
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                        />
                    </label>

                    <label>
                        Nowe hasło

                        <div className="password-input-wrapper">
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onFocus={() => setShowPasswordInfo(true)}
                                onBlur={() => setTimeout(() => setShowPasswordInfo(false), 150)}
                                onChange={handlePasswordChange}
                            />

                            <PasswordStrengthPopup
                                visible={showPasswordInfo}
                                password={passwordForm.newPassword}
                                passwordInfo={getPasswordInfo(passwordForm.newPassword)}
                            />
                        </div>
                    </label>

                    <label>
                        Powtórz nowe hasło
                        <input
                            type="password"
                            name="repeatNewPassword"
                            value={passwordForm.repeatNewPassword}
                            onChange={handlePasswordChange}
                        />
                    </label>

                    <div className="profile-actions">

                        <button onClick={changePassword}>
                            Zapisz nowe hasło
                        </button>

                        <button
                            className="danger"
                            onClick={cancelPasswordEdit}
                        >
                            Anuluj
                        </button>

                    </div>

                </div>
            ) : (
                <>
                    <div className="profile-details">
                        <div className="profile-detail-row">
                            <span className="profile-detail-label">Imię:</span>
                            <span className="profile-detail-value">{user.name}</span>
                        </div>

                        <div className="profile-detail-row">
                            <span className="profile-detail-label">Nazwisko:</span>
                            <span className="profile-detail-value">{user.surname}</span>
                        </div>

                        <div className="profile-detail-row">
                            <span className="profile-detail-label">Email:</span>
                            <span className="profile-detail-value">{user.email}</span>
                        </div>

                        <div className="profile-detail-row">
                            <span className="profile-detail-label">Hasło zmienione:</span>
                            <span className="profile-detail-value">{user.passwordChangedAt}</span>
                        </div>

                        <div className="profile-detail-row">
                            <span className="profile-detail-label">Następna zmiana hasła:</span>
                            <span className="profile-detail-value">{user.passwordNextChangeAt}</span>
                        </div>

                        <div className="profile-detail-row">
                            <span className="profile-detail-label">Status hasła:</span>

                            {user.passwordChangeRequired ? (
                                <span className="profile-detail-value password-warning">
                                    Hasło do menadżera wymaga zmiany.
                                </span>
                            ) : (
                                <span className="profile-detail-value">
                                    Do zmiany hasła zostało: {user.daysToPasswordChange} dni
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="profile-actions">

                        <button onClick={() => {
                            setEditProfile(true);
                            setShowPasswordChange(false);
                            setPasswordError("");
                        }}>
                            Edytuj profil
                        </button>

                        <button onClick={() => {
                            setShowPasswordChange(true);
                            setEditProfile(false);
                            setProfileError("");
                        }}>
                            Zmień hasło
                        </button>

                    </div>
                </>
            )}

        </section>
    );
}