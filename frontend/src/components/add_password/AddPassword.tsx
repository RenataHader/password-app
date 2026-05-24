import "./addPassword.css";
import { useState } from "react";
import PasswordStrengthPopup from "../password_strenght/PasswordStrengthPopup";
type Props = {
    site: string;
    setSite: (v: string) => void;
    link: string;
    setLink: (v: string) => void;
    login: string;
    setLogin: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    category: string;
    setCategory: (v: string) => void;
    addPassword: () => void;
    passwordInfo: {
        label: string;
        className: string;
        checks: {
            minLength: boolean;
            lowerCase: boolean;
            upperCase: boolean;
            number: boolean;
            specialChar: boolean;
        };
    };
};

export default function AddPassword({
    site,
    setSite,
    link,
    setLink,
    login,
    setLogin,
    password,
    setPassword,
    category,
    setCategory,
    addPassword,
    passwordInfo
}: Props) {

    const [showPasswordInfo, setShowPasswordInfo] = useState(false);

    return (
        <div className="add-box">

            <h2>➕ Dodaj hasło</h2>
            <section className="password-input">
                <input
                placeholder="Strona"
                value={site}
                onChange={(e) => setSite(e.target.value)}
            />

            <input
                type="url"
                placeholder="Link (opcjonalnie)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
            />

            <input
                placeholder="Login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
            />

            <div className="password-input-wrapper">
                <input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onFocus={() => setShowPasswordInfo(true)}
                    onBlur={() => setTimeout(() => setShowPasswordInfo(false), 150)}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <PasswordStrengthPopup
                    visible={showPasswordInfo}
                    password={password}
                    passwordInfo={passwordInfo}
                />
            </div>

            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="BANKOWOSC">Bankowość</option>
                <option value="PRACA">Praca</option>
                <option value="INNE">Inne</option>
            </select>

            <button onClick={addPassword}>
                Dodaj
            </button>
            </section>

        </div>
    );
}