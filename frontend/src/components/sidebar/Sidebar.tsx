import "./sidebar.css";

type SidebarProps = {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
};

export default function Sidebar({
    selectedCategory,
    setSelectedCategory
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
                        onClick={() =>
                            setSelectedCategory(category)
                        }
                    >
                        {category}
                    </button>

                ))}

            </nav>

            <button className="logout-btn">
                Wyloguj
            </button>

        </aside>
    );
}