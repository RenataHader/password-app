import "./passwordCard.css";

type PasswordItem = {
    id: number;
    site: string;
    login: string;
    password: string;
    category: string;
    favorite: boolean;
    hidden: boolean;
};

type PasswordCardProps = {
    item: PasswordItem;
    toggleVisibility: (id: number) => void;
    copyPassword: (password: string) => void;
    deletePassword: (id: number) => void;
    toggleFavorite: (id: number) => void;
};

export default function PasswordCard({
    item,
    toggleVisibility,
    copyPassword,
    deletePassword,
    toggleFavorite
}: PasswordCardProps) {

    return (
        <div className="password-card">

            {/* HEADER */}
            <div className="card-header">

                <h3>{item.site}</h3>

                <button
                    className="star-btn"
                    onClick={() => toggleFavorite(item.id)}
                >
                    {item.favorite ? "⭐" : "☆"}
                </button>

            </div>

            {/* INFO */}
            <p className="login">{item.login}</p>

            <p className="password">
                {item.hidden ? "********" : item.password}
            </p>

            <span className="category-tag">
                {item.category}
            </span>

            {/* ACTIONS */}
            <div className="actions">

                <button onClick={() => toggleVisibility(item.id)}>
                    {item.hidden ? "Pokaż" : "Ukryj"}
                </button>

                <button onClick={() => copyPassword(item.password)}>
                    Kopiuj
                </button>

                <button
                    className="delete-btn"
                    onClick={() => deletePassword(item.id)}
                >
                    Usuń
                </button>
            </div>

        </div>
    );
}