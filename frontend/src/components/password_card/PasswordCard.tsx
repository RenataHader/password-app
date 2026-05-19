import "./passwordCard.css";

type PasswordItem = {
    id: number;
    site: string;
    link?: string;
    login: string;
    password: string;
    category: string;
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
    deletePassword,

}: PasswordCardProps) {

    return (
        <div className="password-card">

            {/* HEADER */}
            <div className="card-header">

                <h3>{item.site}</h3>

            </div>
            {item.link && (
                <p>
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="site-link"
                    >
                        {item.link}
                    </a>
                </p>
            )}

            {/* INFO */}
            <p className="login">{item.login}</p>

            <p className="password">
                {item.hidden ? "********" : item.password}
            </p>

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