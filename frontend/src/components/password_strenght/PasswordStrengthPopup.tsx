import "./passwordStrengthPopup.css";

type PasswordInfo = {
    label: string;
    className: string;
    checks: {
        minLength: boolean;
        lowerCase: boolean;
        upperCase: boolean;
        number: boolean;
        specialChar: boolean;
    };
};

type Props = {
    passwordInfo: PasswordInfo;
    visible: boolean;
    password: string;
};

export default function PasswordStrengthPopup({
    passwordInfo,
    visible,
    password,
}: Props) {
    if (!visible || !password) {
        return null;
    }

    return (
        <div className={`password-popup ${passwordInfo.className}`}>
            <p className="password-popup-title">
                {passwordInfo.label}
            </p>

            <ul>
                <li className={passwordInfo.checks.minLength ? "ok" : "bad"}>
                    {passwordInfo.checks.minLength ? "✓" : "✗"} Minimum 8 znaków
                </li>

                <li className={passwordInfo.checks.lowerCase ? "ok" : "bad"}>
                    {passwordInfo.checks.lowerCase ? "✓" : "✗"} Mała litera
                </li>

                <li className={passwordInfo.checks.upperCase ? "ok" : "bad"}>
                    {passwordInfo.checks.upperCase ? "✓" : "✗"} Duża litera
                </li>

                <li className={passwordInfo.checks.number ? "ok" : "bad"}>
                    {passwordInfo.checks.number ? "✓" : "✗"} Cyfra
                </li>

                <li className={passwordInfo.checks.specialChar ? "ok" : "bad"}>
                    {passwordInfo.checks.specialChar ? "✓" : "✗"} Znak specjalny
                </li>
            </ul>
        </div>
    );
}