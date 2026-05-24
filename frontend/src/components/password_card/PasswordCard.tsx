import "./passwordCard.css";
import { useState } from "react";
import PasswordStrengthPopup from "../password_strenght/PasswordStrengthPopup";
import { getPasswordInfo } from "../password_strenght/passwordStrength";

type PasswordItem = {
    id: number;
    site: string;
    link?: string;
    login: string;
    password?: string;
    category: string;
    hidden: boolean;
};

type PasswordCardProps = {
    item: PasswordItem;
    toggleVisibility: (id: number) => void;
    copyPassword: (id: number) => void;
    deletePassword: (id: number) => void;
    updateSavedPassword: (id: number, currentPassword: string, newPassword: string) => Promise<boolean>;
};

export default function PasswordCard({
    item,
    toggleVisibility,
    copyPassword,
    deletePassword,
    updateSavedPassword
}: PasswordCardProps) {
    const [changingPassword, setChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatNewPassword, setRepeatNewPassword] = useState("");
    const [showPasswordInfo, setShowPasswordInfo] = useState(false);

    const handlePasswordChange = async () => {
        if (!currentPassword.trim()) {
            alert("Podaj aktualne hasło");
            return;
        }

        if (!newPassword.trim()) {
            alert("Podaj nowe hasło");
            return;
        }

        if (newPassword !== repeatNewPassword) {
            alert("Hasła się nie zgadzają");
            return;
        }

        const success = await updateSavedPassword(item.id, currentPassword, newPassword);

        if (!success) {
            return;
        }

        setChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setRepeatNewPassword("");
    };

    if (changingPassword) {
        return (
            <div className="password-card">
                <div className="card-header">
                    <h3>{item.site}</h3>
                </div>

                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Aktualne zapisane hasło"
                />

                <div className="password-input-wrapper">
                    <input
                        type="password"
                        value={newPassword}
                        onFocus={() => setShowPasswordInfo(true)}
                        onBlur={() => setTimeout(() => setShowPasswordInfo(false), 150)}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nowe hasło"
                    />

                    <PasswordStrengthPopup
                        visible={showPasswordInfo}
                        password={newPassword}
                        passwordInfo={getPasswordInfo(newPassword)}
                    />
                </div>

                <input
                    type="password"
                    value={repeatNewPassword}
                    onChange={(e) => setRepeatNewPassword(e.target.value)}
                    placeholder="Powtórz nowe hasło"
                />

                <div className="actions">
                    <button onClick={handlePasswordChange}>
                        Zapisz nowe hasło
                    </button>

                    <button
                        onClick={() => {
                            setChangingPassword(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setRepeatNewPassword("");
                        }}
                    >
                        Anuluj
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="password-card">
            <div className="card-header">
                <h3>{item.site}</h3>
            </div>

            <p>
                {item.link ? (
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="site-link"
                    >
                        {item.link}
                    </a>
                ) : (
                    <span className="no-link">
                        Brak linku
                    </span>
                )}
            </p>

            <p className="login">{item.login}</p>

            <p className="password">
                {item.hidden ? "********" : item.password ?? ""}
            </p>

            <div className="actions">
                <button onClick={() => toggleVisibility(item.id)}>
                    {item.hidden ? "Pokaż" : "Ukryj"}
                </button>

                <button onClick={() => copyPassword(item.id)}>
                    Kopiuj
                </button>

                <button onClick={() => setChangingPassword(true)}>
                    Zmień hasło
                </button>

                <button
                    className="delete-btn"
                    onClick={() => deletePassword(item.id)}
                >
                    Usuń
                </button>
            </div>
        </div>
    );
}