import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = () => {
        setError("");

        if (!email || !password) {
            setError("Wypełnij wszystkie pola!");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!user) {
            setError("Brak konta. Zarejestruj się!");
            return;
        }

        if (user.email !== email || user.password !== password) {
            setError("Niepoprawny email lub hasło!");
            return;
        }

        // sukces logowania
        localStorage.setItem("loggedIn", "true");

        navigate("/dashboard");
    };

    return (
        <div className="container">

            <img
                src="/images/full_logo.png"
                alt="PassManager logo"
                className="top-logo"
            />

            <div className="login-box">

                <h1 className="logo">🔐 PassManager</h1>
                <h2>Logowanie</h2>

                <section className="login-input">

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button onClick={handleLogin}>
                        Zaloguj się
                    </button>

                </section>

                {error && <p className="error">{error}</p>}

                <p className="register-link">
                    Nie masz konta?{" "}
                    <a href="/register">Zarejestruj się</a>
                </p>

            </div>
        </div>
    );
}