import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import SearchBar from "../components/search_bar/SearchBar";
import PasswordCard from "../components/password_card/PasswordCard";
import AddPassword from "../components/add_password/AddPassword";
import Generator from "../components/generator/Generator";
import "./dashboard.css";

type PasswordItem = {
    id: number;
    site: string;
    link?: string;
    login: string;
    password: string;
    category: string;
    hidden: boolean;
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [items, setItems] = useState<PasswordItem[]>([]);
    const [search, setSearch] = useState("");
    const [copied, setCopied] = useState(false);

    const [site, setSite] = useState("");
    const [link, setLink] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [category, setCategory] = useState("SOCIAL_MEDIA");
    const [selectedCategory, setSelectedCategory] = useState("Wszystkie");
    const [view, setView] = useState<"list" | "add">("list");

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchPasswords = async () => {
        if (!user.userId) return;
        try {
            const response = await fetch(`http://localhost:8080/api/passwords/${user.userId}`);
            if (!response.ok) throw new Error();
            const data = await response.json();

            const mapped = data.map((entry: any) => ({
                id: entry.id,
                site: entry.name,
                link: entry.link,
                login: entry.login,
                password: entry.password,
                category: entry.category,
                hidden: true
            }));
            setItems(mapped);
        } catch (err) {
            console.error("Błąd pobierania haseł");
        }
    };

    useEffect(() => {
        fetchPasswords();
    }, []);

    const normalizeLink = (value: string) => {
        const trimmed = value.trim();

        if (!trimmed) return null;
        if (/^https?:\/\//i.test(trimmed)) return trimmed;

        return `https://${trimmed}`;
    };

    const addPassword = async () => {
        if (!site.trim() || !login.trim() || !password || !user.userId) return;

        try {
            const response = await fetch(`http://localhost:8080/api/passwords/${user.userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                                site: site.trim(),
                                link: normalizeLink(link),
                                login: login.trim(),
                                password,
                                category
                            })
            });

            if (response.ok) {
                setSite("");
                setLink("");
                setLogin("");
                setPassword("");
                setView("list");
                fetchPasswords();
            }
        } catch (err) {
            console.error("Błąd zapisu hasła");
        }
    };

    const deletePassword = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:8080/api/passwords/${id}`, { method: "DELETE" });
            if (response.ok) {
                setItems(items.filter(item => item.id !== id));
            }
        } catch (err) {
            console.error("Błąd usuwania");
        }
    };

    const toggleVisibility = (id: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, hidden: !item.hidden } : item
        ));
    };

    const copyPassword = async (pass: string) => {
        await navigator.clipboard.writeText(pass);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const filtered = items.filter(item => {
        const matchSearch = item.site.toLowerCase().includes(search.toLowerCase());

        const matchCategory =
            selectedCategory === "Wszystkie" ||
            item.category === selectedCategory;

        return matchSearch && matchCategory;
    });

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="dashboard-container">
            <Sidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setView={setView}
                onLogout={handleLogout}
            />
            <main className="main">
                {view === "list" && <SearchBar search={search} setSearch={setSearch} />}
                {copied && <div className="copy-toast">📋 Skopiowano hasło!</div>}
                {view === "list" && (
                    <div className="list">
                        {filtered.length === 0 ? (
                            <p className="empty">Brak zapisanych haseł</p>
                        ) : (
                            filtered.map(item => (
                                <PasswordCard
                                    key={item.id}
                                    item={item}
                                    toggleVisibility={toggleVisibility}
                                    copyPassword={copyPassword}
                                    deletePassword={deletePassword}

                                />
                            ))
                        )}
                    </div>
                )}
                {view === "add" && (
                    <div className="add-view">
                        <AddPassword
                            site={site} setSite={setSite}
                            link={link} setLink={setLink}
                            login={login} setLogin={setLogin}
                            password={password} setPassword={setPassword}
                            category={category} setCategory={setCategory}
                            addPassword={addPassword}
                        />
                        <Generator
                            password={generatedPassword}
                            setPassword={setGeneratedPassword}
                            copyPassword={copyPassword}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}