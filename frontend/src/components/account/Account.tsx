import "./account.css";
import { useState, useEffect } from "react";

type User = {
    id?: string;
    name: string;
    surname: string;
    email: string;
    preferences: {
        notifications: boolean;
    };
};

export default function Account() {

    const [editProfile, setEditProfile] = useState(false);

    const [user, setUser] = useState<User>(() => {
        const stored = localStorage.getItem("user");

        if (!stored) {
            return {
                name: "",
                surname: "",
                email: "",
            };
        }

        return JSON.parse(stored);
    });

    const [profileForm, setProfileForm] = useState({
        name: user.name,
        surname: user.surname,
        email: user.email
    });


    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveProfile = async () => {
        const updatedUser = {
            ...user,
            ...profileForm
        };

        try {
            const res = await fetch(`http://localhost:8080/api/users/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedUser)
            });

            if (!res.ok) throw new Error("Update failed");

            const saved = await res.json();

            setUser(saved);
            localStorage.setItem("user", JSON.stringify(saved));

            setEditProfile(false);

        } catch (err) {
            console.error("Nie udało się zapisać profilu");
        }
    };

    const changePassword = () => {
        alert("Tu możesz dodać modal zmiany hasła 🔐");
    };


    return (
        <section className="profile-section">

            <h2>👤 Mój profil</h2>

            {!editProfile ? (
                <>
                    <p><strong>Imię:</strong> {user.name}</p>
                    <p><strong>Nazwisko:</strong> {user.surname}</p>
                    <p><strong>Email:</strong> {user.email}</p>


                    <div className="profile-actions">

                        <button onClick={() => setEditProfile(true)}>
                            Edytuj profil
                        </button>

                        <button onClick={changePassword}>
                            Zmień hasło
                        </button>

                    </div>
                </>
            ) : (
                <>
                    <div className="profile-form">

                        <label>
                            Imię
                            <input
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileChange}
                            />
                        </label>

                        <label>
                            Nazwisko
                            <input
                                name="surname"
                                value={profileForm.surname}
                                onChange={handleProfileChange}
                            />
                        </label>

                        <label>
                            Email
                            <input
                                name="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                            />
                        </label>

                    </div>

                    <div className="profile-actions">

                        <button onClick={saveProfile}>
                            Zapisz
                        </button>

                        <button
                            className="danger"
                            onClick={() => setEditProfile(false)}
                        >
                            Anuluj
                        </button>

                    </div>
                </>
            )}

        </section>
    );
}