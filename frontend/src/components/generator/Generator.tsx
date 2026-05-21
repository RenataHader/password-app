import "./generator.css";

type Props = {
    password: string;
    setPassword: (v: string) => void;
    copyPassword: (pass: string) => void;
};

export default function Generator({
    password,
    setPassword,
    copyPassword
}: Props) {

    const generate = () => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

        let pass = "";
        const randomValues = new Uint32Array(16);

        window.crypto.getRandomValues(randomValues);

        for (let i = 0; i < 16; i++) {
            pass += chars[randomValues[i] % chars.length];
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
                <div className="generated-row">
                    <p className="preview">
                        {password}
                    </p>

                    <button
                        type="button"
                        className="copy-generated-btn"
                        onClick={() => copyPassword(password)}
                    >
                        Kopiuj
                    </button>
                </div>
            )}

        </div>
    );
}