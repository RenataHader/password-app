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
        "Wszystkie",
        "Ulubione",
        "Social Media",
        "Bankowość",
        "Praca",
        "Programowanie",
        "Inne"
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
                        key={category}
                        className={
                            selectedCategory === category
                                ? "active"
                                : ""
                        }
                        onClick={() => {
                            setSelectedCategory(category);
                            setView("list");
                        }}
                    >
                        {category}
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