import { useState } from "react";
import "./addPassword.css";

type Props = {
    site: string;
    setSite: (v: string) => void;
    login: string;
    setLogin: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    category: string;
    setCategory: (v: string) => void;
    addPassword: () => void;
};

export default function AddPassword({
    site,
    setSite,
    login,
    setLogin,
    password,
    setPassword,
    category,
    setCategory,
    addPassword
}: Props) {

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
                placeholder="Login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
            />

            <input
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option>Social Media</option>
                <option>Bankowość</option>
                <option>Praca</option>
                <option>Programowanie</option>
                <option>Inne</option>
            </select>

            <button onClick={addPassword}>
                Dodaj
            </button>
            </section>

        </div>
    );
}