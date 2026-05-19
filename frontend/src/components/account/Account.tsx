import "./account.css";
import { useState, useEffect } from "react";

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
    const [error, setError] = useState("");

    const [user, setUser] = useState<User | null>(null);

    const [profileForm, setProfileForm] = useState({
        name: "",
        surname: "",
        email: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: ""
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
                setError("Nie jesteś zalogowana albo sesja wygasła.");
                return;
            }

            const data = await res.json();

            setUser(data);

            setProfileForm({
                name: data.name,
                surname: data.surname,
                email: data.email
            });

            setError("");
        } catch (err) {
            console.error("Nie udało się pobrać danych profilu", err);
            setError("Nie udało się pobrać danych profilu.");
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
                setError(message);
                return;
            }

            const saved = await res.json();

            setUser(saved);
            setEditProfile(false);
            setError("");

        } catch (err) {
            console.error("Nie udało się zapisać profilu", err);
            setError("Nie udało się zapisać profilu.");
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
        setError("");
    };

    const changePassword = async () => {
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
                setError(message);
                return;
            }

            const saved = await res.json();

            setUser(saved);

            setPasswordForm({
                currentPassword: "",
                newPassword: ""
            });

            setShowPasswordChange(false);
            setError("");

        } catch (err) {
            console.error("Nie udało się zmienić hasła", err);
            setError("Nie udało się zmienić hasła.");
        }
    };

    if (!user) {
        return (
            <section className="profile-section">
                <h2>👤 Mój profil</h2>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}
            </section>
        );
    }

    return (
        <section className="profile-section">

            <h2>👤 Mój profil</h2>

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            {!editProfile ? (
                <>
                    <p><strong>Imię:</strong> {user.name}</p>
                    <p><strong>Nazwisko:</strong> {user.surname}</p>
                    <p><strong>Email:</strong> {user.email}</p>

                    <p><strong>Hasło zmienione:</strong> {user.passwordChangedAt}</p>
                    <p><strong>Następna zmiana hasła:</strong> {user.passwordNextChangeAt}</p>

                    {user.passwordChangeRequired ? (
                        <p className="password-warning">
                            Hasło do menadżera wymaga zmiany.
                        </p>
                    ) : (
                        <p>
                            Do zmiany hasła zostało: {user.daysToPasswordChange} dni
                        </p>
                    )}

                    <div className="profile-actions">

                        <button onClick={() => setEditProfile(true)}>
                            Edytuj profil
                        </button>

                        <button onClick={() => setShowPasswordChange(prev => !prev)}>
                            Zmień hasło
                        </button>

                    </div>
                </>
            ) : (
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
            )}

            {showPasswordChange && (
                <div className="profile-form password-change-box">

                    <h3>Zmiana hasła do menadżera</h3>

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
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                        />
                    </label>

                    <div className="profile-actions">

                        <button onClick={changePassword}>
                            Zapisz nowe hasło
                        </button>

                        <button
                            className="danger"
                            onClick={() => {
                                setShowPasswordChange(false);
                                setPasswordForm({
                                    currentPassword: "",
                                    newPassword: ""
                                });
                                setError("");
                            }}
                        >
                            Anuluj
                        </button>

                    </div>

                </div>
            )}

        </section>
    );
}