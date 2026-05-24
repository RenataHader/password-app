export const getPasswordInfo = (value: string) => {
    const checks = {
        minLength: value.length >= 8,
        lowerCase: /[a-z]/.test(value),
        upperCase: /[A-Z]/.test(value),
        number: /\d/.test(value),
        specialChar: /[^A-Za-z0-9]/.test(value)
    };

    const passedCount = Object.values(checks).filter(Boolean).length;

    let label = "Słabe hasło";
    let className = "weak";

    if (passedCount >= 4) {
        label = "Średnie hasło";
        className = "medium";
    }

    if (passedCount === 5 && value.length >= 12) {
        label = "Mocne hasło";
        className = "strong";
    }

    return {
        label,
        className,
        checks
    };
};