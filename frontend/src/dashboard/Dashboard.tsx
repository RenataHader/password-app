import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPasswordInfo } from "../components/password_strenght/passwordStrength";

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
    password?: string;
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

             if (res.status === 401) {
                  navigate("/");
                  return;
             }

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
                password: undefined,
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

        if (!site.trim() || !login.trim() || !password.trim()) {
            alert("Uzupełnij wszystkie pola");
            return;
        }

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

    const toggleVisibility = async (id: number) => {
        const item = items.find(i => i.id === id);

        if (!item) return;

        if (!item.hidden) {
            setItems(prev =>
                prev.map(i =>
                    i.id === id ? { ...i, hidden: true, password: undefined } : i
                )
            );
            return;
        }

        try {
            const response = await fetch(`/api/passwords/${id}/reveal`, {
                credentials: "include"
            });

            if (response.status === 401) {
                navigate("/");
                return;
            }

            if (!response.ok) {
                alert("Nie udało się pobrać hasła");
                return;
            }

            const data = await response.json();

            setItems(prev =>
                prev.map(i =>
                    i.id === id
                        ? { ...i, password: data.password, hidden: false }
                        : i
                )
            );
        } catch (err) {
            alert("Błąd połączenia z serwerem");
        }
    };

   const deletePassword = async (id: number) => {

        const confirmed = window.confirm("Czy na pewno chcesz usunąć to hasło?");

        if (!confirmed) {
            return;
        }

       const response = await fetch(`/api/passwords/${id}`, {
           method: "DELETE",
           credentials: "include"
       });

       if (response.status === 401) {
           navigate("/");
           return;
       }

       if (!response.ok) {
           alert("Nie udało się usunąć hasła");
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

    const updateSavedPassword = async (
        id: number,
        currentPassword: string,
        newPassword: string
    ): Promise<boolean> => {
        const response = await fetch(`/api/passwords/${id}/password`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (response.status === 401) {
            navigate("/");
            return false;
        }

        if (!response.ok) {
            const message = await response.text();
            alert(message || "Nie udało się zmienić hasła");
            return false;
        }

        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, password: undefined, hidden: true }
                    : item
            )
        );

        alert("Hasło zostało zmienione");
        return true;
    };

    const copySavedPassword = async (id: number) => {
        try {
            const item = items.find(i => i.id === id);

            let passwordToCopy = item?.password;

            if (!passwordToCopy) {
                const response = await fetch(`/api/passwords/${id}/reveal`, {
                    credentials: "include"
                });

                if (response.status === 401) {
                    navigate("/");
                    return;
                }

                if (!response.ok) {
                    alert("Nie udało się pobrać hasła");
                    return;
                }

                const data = await response.json();
                passwordToCopy = data.password;
            }

            await navigator.clipboard.writeText(passwordToCopy);

            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            alert("Nie udało się skopiować hasła");
        }
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
                {copied && (
                    <div className="copy-toast">
                          📋 Skopiowano hasło!
                    </div>
                )}

                {view === "list" && (
                    <>
                        <SearchBar search={search} setSearch={setSearch} />

                        <div className="list">
                            {filtered.length === 0 ? (
                                <p className="empty">Brak zapisanych haseł</p>
                            ) : (
                                filtered.map(item => (
                                    <PasswordCard
                                        key={item.id}
                                        item={item}
                                        toggleVisibility={toggleVisibility}
                                        copyPassword={copySavedPassword}
                                        deletePassword={deletePassword}
                                        updateSavedPassword={updateSavedPassword}
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
                            passwordInfo={getPasswordInfo(password)}
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