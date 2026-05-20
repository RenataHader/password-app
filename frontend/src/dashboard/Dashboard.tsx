import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import SearchBar from "../components/search_bar/SearchBar";
import PasswordCard from "../components/password_card/PasswordCard";
import AddPassword from "../components/add_password/AddPassword";
import Generator from "../components/generator/Generator";
import Account from "../components/account/Account";

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

type View = "list" | "add" | "account";

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
    const [view, setView] = useState<View>("list");

    const fetchPasswords = async () => {
        try {
            const res = await fetch("/api/passwords", {
                credentials: "include"
            });

            if (!res.ok) {
                console.error("Nie udało się pobrać haseł");
                return;
            }

            const data = await res.json();

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
            console.error("Błąd pobierania haseł", err);
        }
    };

    useEffect(() => {
        fetchPasswords();
    }, []);

    const normalizeLink = (value: string) => {
        if (!value.trim()) return null;
        return /^https?:\/\//i.test(value) ? value : `https://${value}`;
    };

    const addPassword = async () => {
        if (!site || !login || !password) return;

        const response = await fetch("/api/passwords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                site,
                link: normalizeLink(link),
                login,
                password,
                category
            })
        });

        if (!response.ok) {
            console.error("Nie udało się dodać hasła");
            return;
        }

        setSite("");
        setLink("");
        setLogin("");
        setPassword("");
        setGeneratedPassword("");

        await fetchPasswords();

        setView("list");
    };

    const toggleVisibility = (id: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, hidden: !item.hidden } : item
            )
        );
    };

   const deletePassword = async (id: number) => {
       const response = await fetch(`/api/passwords/${id}`, {
           method: "DELETE",
           credentials: "include"
       });

       if (!response.ok) {
           console.error("Nie udało się usunąć hasła");
           return;
       }

       setItems(prev => prev.filter(i => i.id !== id));
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

const handleLogout = async () => {
    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
    });

    navigate("/");
};

    return (
        <div className="dashboard-container">

            <Sidebar
                selectedCategory={selectedCategory}
                activeView={view}
                setSelectedCategory={setSelectedCategory}
                setView={setView}
                onLogout={handleLogout}
            />

            <main className="main">

                {view === "list" && (
                    <>
                        <SearchBar search={search} setSearch={setSearch} />

                        {copied && (
                            <div className="copy-toast">
                                📋 Skopiowano hasło!
                            </div>
                        )}

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
                    </>
                )}

                {view === "add" && (
                    <div className="add-view">

                        <AddPassword
                            site={site}
                            setSite={setSite}
                            link={link}
                            setLink={setLink}
                            login={login}
                            setLogin={setLogin}
                            password={password}
                            setPassword={setPassword}
                            category={category}
                            setCategory={setCategory}
                            addPassword={addPassword}
                        />

                        <Generator
                            password={generatedPassword}
                            setPassword={setGeneratedPassword}
                            copyPassword={copyPassword}
                        />

                    </div>
                )}

                {view === "account" && (
                    <Account />
                )}

            </main>
        </div>
    );
}