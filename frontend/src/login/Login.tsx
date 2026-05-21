import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");

        if (!email || !password) {
            setError("Wypełnij wszystkie pola!");
            return;
        }

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            console.log("STATUS:", response.status);

            if (response.ok) {
                console.log("LOGIN OK - CODE SENT");
                setCodeSent(true);
            } else {
                const errorText = await response.text();
                console.log("LOGIN ERROR:", errorText);
                setError(errorText);
            }

        } catch (err) {
            console.log("NETWORK ERROR:", err);
            setError("Błąd połączenia z serwerem");
        }
    };

    const handleVerifyCode = async () => {
        setError("");

        if (!code) {
            setError("Wpisz kod z emaila!");
            return;
        }

        try {
            const response = await fetch("/api/verify-login-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ code })
            });

            console.log("VERIFY STATUS:", response.status);

            if (response.ok) {
                console.log("VERIFY OK - NAVIGATE");
                navigate("/dashboard");
            } else {
                const errorText = await response.text();
                console.log("VERIFY ERROR:", errorText);
                setError(errorText);
            }

        } catch (err) {
            console.log("NETWORK ERROR:", err);
            setError("Błąd połączenia z serwerem");
        }
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
                    {!codeSent ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Kod z emaila"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <button onClick={handleVerifyCode}>
                                Potwierdź kod
                            </button>
                        </>
                    )}
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