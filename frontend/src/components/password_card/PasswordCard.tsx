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
};

export default function PasswordCard({
    item,
    toggleVisibility,
    copyPassword,
    deletePassword
}: PasswordCardProps) {

    return (

        <div className="password-card">

            <div className="card-header">

                <h3>{item.site}</h3>

                {item.favorite && <span>⭐</span>}

            </div>

            <p>{item.login}</p>

            <p>
                {item.hidden
                    ? "********"
                    : item.password}
            </p>

            <span className="category-tag">
                {item.category}
            </span>

            <div className="actions">

                <button
                    onClick={() =>
                        toggleVisibility(item.id)
                    }
                >
                    Pokaż
                </button>

                <button
                    onClick={() =>
                        copyPassword(item.password)
                    }
                >
                    Kopiuj
                </button>

                <button
                    onClick={() =>
                        deletePassword(item.id)
                    }
                >
                    Usuń
                </button>

            </div>

        </div>
    );
}