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

    const getSecureRandomIndex = (max: number) => {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] % max;
    };

    const generatePassword = () => {
        const length = 16;

        const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowerCase = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const specialChars = "!@#$%^&*-_+?";

        const allChars = upperCase + lowerCase + numbers + specialChars;

        const getRandomChar = (chars: string) => {
            return chars[getSecureRandomIndex(chars.length)];
        };

        const shuffle = (value: string) => {
            const chars = value.split("");

            for (let i = chars.length - 1; i > 0; i--) {
                const j = getSecureRandomIndex(i + 1);
                [chars[i], chars[j]] = [chars[j], chars[i]];
            }

            return chars.join("");
        };

        let generated = "";

        generated += getRandomChar(upperCase);
        generated += getRandomChar(lowerCase);
        generated += getRandomChar(numbers);
        generated += getRandomChar(specialChars);

        for (let i = generated.length; i < length; i++) {
            generated += getRandomChar(allChars);
        }

        setPassword(shuffle(generated));
    };

    return (
        <div className="generator-box">

            <h3>🔑 Generator</h3>

            <button type="button" onClick={generatePassword}>
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