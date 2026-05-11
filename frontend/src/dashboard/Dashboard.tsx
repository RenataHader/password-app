import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import SearchBar from "../components/search_bar/SearchBar";
import PasswordCard from "../components/password_card/PasswordCard";
import AddPassword from "../components/add_password/AddPassword";
import Generator from "../components/generator/Generator";
import "./dashboard.css";

type PasswordItem = {
    id: number;
    site: string;
    login: string;
    password: string;
    category: string;
    favorite: boolean;
    hidden: boolean;
};

export default function Dashboard() {

    const [items, setItems] = useState<PasswordItem[]>([]);
    const [search, setSearch] = useState("");

    const [site, setSite] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [category, setCategory] = useState("Social Media");

    const [selectedCategory, setSelectedCategory] = useState("Wszystkie");

    useEffect(() => {
        const data = localStorage.getItem("passwords");
        if (data) setItems(JSON.parse(data));
    }, []);

    useEffect(() => {
        localStorage.setItem("passwords", JSON.stringify(items));
    }, [items]);

    const addPassword = () => {

        if (!site || !login || !password) return;

        const newItem: PasswordItem = {
            id: Date.now(),
            site,
            login,
            password,
            category,
            favorite: false,
            hidden: true
        };

        setItems([...items, newItem]);

        setSite("");
        setLogin("");
        setPassword("");
    };

    const toggleVisibility = (id: number) => {
        setItems(items.map(i =>
            i.id === id ? { ...i, hidden: !i.hidden } : i
        ));
    };

    const deletePassword = (id: number) => {
        setItems(items.filter(i => i.id !== id));
    };

    const copyPassword = (pass: string) => {
        navigator.clipboard.writeText(pass);
    };

    const filtered = items.filter(item => {

        const matchSearch =
            item.site.toLowerCase().includes(search.toLowerCase());

        const matchCategory =
            selectedCategory === "Wszystkie" ||
            item.category === selectedCategory;

        return matchSearch && matchCategory;
    });

    return (
        <div className="dashboard-container">

            <Sidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            <main className="main">

                <SearchBar
                    search={search}
                    setSearch={setSearch}
                />

                <div className="grid">

                    <AddPassword
                        site={site}
                        setSite={setSite}
                        login={login}
                        setLogin={setLogin}
                        password={password}
                        setPassword={setPassword}
                        category={category}
                        setCategory={setCategory}
                        addPassword={addPassword}
                    />

                    <Generator
                        password={password}
                        setPassword={setPassword}
                    />

                </div>

                <div className="list">

                    {filtered.map(item => (

                        <PasswordCard
                            key={item.id}
                            item={item}
                            toggleVisibility={toggleVisibility}
                            copyPassword={copyPassword}
                            deletePassword={deletePassword}
                        />

                    ))}

                </div>

            </main>

        </div>
    );
}