import "./sidebar.css";
type View = "list" | "add" | "account";

type SidebarProps = {
    selectedCategory: string;
    activeView: View;
    setSelectedCategory: (category: string) => void;
    setView: (view: View) => void;
    onLogout: () => void;
};

export default function Sidebar({
    selectedCategory,
    activeView,
    setSelectedCategory,
    setView,
    onLogout
}: SidebarProps) {

    const categories = [
        { label: "Wszystkie", value: "Wszystkie" },
        { label: "Social Media", value: "SOCIAL_MEDIA" },
        { label: "Bankowość", value: "BANKOWOSC" },
        { label: "Praca", value: "PRACA" },
        { label: "Inne", value: "INNE" }
    ];

    return (
        <aside className="sidebar">

            <img
                src="/images/full_logo.png"
                alt="logo"
                className="sidebar-logo"
            />

            <nav className="sidebar-menu">

                {categories.map(category => (
                    <button
                        key={category.value}
                        className={
                            activeView === "list" && selectedCategory === category.value
                                ? "active"
                                : ""
                        }
                        onClick={() => {
                            setSelectedCategory(category.value);
                            setView("list");
                        }}
                    >
                        {category.label}
                    </button>
                ))}

                <hr />

                <button
                    className={activeView === "add" ? "add-btn active" : "add-btn"}
                    onClick={() => setView("add")}
                >
                    ➕ Dodaj nowe hasło
                </button>

                <button
                    className={activeView === "account" ? "active" : ""}
                    onClick={() => setView("account")}
                >
                    👤 Moje konto
                </button>

            </nav>

            <button
                className="logout-btn"
                onClick={onLogout}
            >
                Wyloguj
            </button>

        </aside>
    );
}