import "./sidebar.css";

type SidebarProps = {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    setView: (view: "list" | "add") => void;
    onLogout: () => void;
};

export default function Sidebar({
    selectedCategory,
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
                            selectedCategory === category.value
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
                    className="add-btn"
                    onClick={() => setView("add")}
                >
                    ➕ Dodaj nowe hasło
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