import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";
import PasswordStrengthPopup from "../components/password_strenght/PasswordStrengthPopup";
import { getPasswordInfo } from "../components/password_strenght/passwordStrength";

export default function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    const navigate = useNavigate();
    const [showPasswordInfo, setShowPasswordInfo] = useState(false);

    const handleRegister = async () => {
        setError("");
        if (!firstName || !lastName || !email || !password || !repeatPassword) {
            setError("Wypełnij wszystkie pola!");
            return;
        }

        if (!passwordRegex.test(password)) {
            setError("Hasło musi mieć min. 8 znaków, 1 wielką literę, 1 cyfrę i 1 znak specjalny");
            return;
        }

        if (password !== repeatPassword) {
            setError("Hasła się nie zgadzają!");
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: firstName, surname: lastName, email, password })
            });

            const message = await response.text();

            if (response.ok) {
                navigate("/");
            } else {
                setError(message);
            }
        } catch (err) {
            setError("Błąd połączenia z serwerem");
        }
    };

    return (
        <div className="container">
            <img src="/images/full_logo.png" alt="PassManager logo" className="top-logo" />
            <div className="register-box">

                <h1 className="logo">🔐 PassManager</h1>
                <h2>Rejestracja</h2>

                <section className="register-input">

                    <input
                        type="text"
                        placeholder="Imię"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Nazwisko"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                            passwordInfo={getPasswordInfo(password)}
                        />
                    </div>

                    <input
                        type="password"
                        placeholder="Powtórz hasło"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                    />

                    <button onClick={handleRegister}>
                        Zarejestruj się
                    </button>

                </section>

                {error && <p className="error">{error}</p>}

                <p className="register-link">
                    Masz konto? <Link to="/">Zaloguj się</Link>
                </p>

            </div>
        </div>
    );
}