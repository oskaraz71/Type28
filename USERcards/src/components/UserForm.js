import React, { useState } from "react";

function UserForm({ onCreate }) {
    const [username, setUsername] = useState("");
    const [city, setCity] = useState("");
    const [age, setAge] = useState("");
    const [image, setImage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && city && age && image) {
            onCreate({ username, city, age, image });
            setUsername("");
            setCity("");
            setAge("");
            setImage("");
        }
    };

    return (
        <form className="user-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
            />
            <input
                type="text"
                placeholder="Image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
            />
            <button type="submit">Create User</button>
        </form>
    );
}

export default UserForm;
