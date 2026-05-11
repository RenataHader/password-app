import "./generator.css";

type Props = {
    password: string;
    setPassword: (v: string) => void;
};

export default function Generator({
    password,
    setPassword
}: Props) {

    const generate = () => {

        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

        let pass = "";

        for (let i = 0; i < 12; i++) {
            pass += chars[Math.floor(Math.random() * chars.length)];
        }

        setPassword(pass);
    };

    return (
        <div className="generator-box">

            <h3>🔑 Generator</h3>

            <button onClick={generate}>
                Generuj hasło
            </button>

            {password && (
                <p className="preview">
                    {password}
                </p>
            )}

        </div>
    );
}