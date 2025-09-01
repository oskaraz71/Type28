import React, { useState } from 'react';
import './App.css';
import UserCard from './components/UserCard';

function App() {
    const [users, setUsers] = useState([
        {
            username: 'jdoe',
            realname: 'John Doe',
            age: '32',
            gender: 'male',
            phone: '+37061234567',
            email: 'jdoe@example.com',
            address: 'Vilnius, Lithuania',
            photo: 'https://randomuser.me/api/portraits/men/10.jpg'
        },
        {
            username: 'asmith',
            realname: 'Alice Smith',
            age: '28',
            gender: 'female',
            phone: '+37062345678',
            email: 'asmith@example.com',
            address: 'Kaunas, Lithuania',
            photo: 'https://randomuser.me/api/portraits/women/11.jpg'
        },
        {
            username: 'bjonas',
            realname: 'Benas Jonas',
            age: '45',
            gender: 'male',
            phone: '+37063456789',
            email: 'benas@example.com',
            address: 'Klaipėda, Lithuania',
            photo: 'https://randomuser.me/api/portraits/men/22.jpg'
        },
        {
            username: 'ege',
            realname: 'Eglė Gečaitė',
            age: '30',
            gender: 'female',
            phone: '+37064567890',
            email: 'egle@example.com',
            address: 'Šiauliai, Lithuania',
            photo: 'https://randomuser.me/api/portraits/women/33.jpg'
        },
        {
            username: 'dvas',
            realname: 'Dainius Vasiliauskas',
            age: '37',
            gender: 'male',
            phone: '+37065678901',
            email: 'dainius@example.com',
            address: 'Panevėžys, Lithuania',
            photo: 'https://randomuser.me/api/portraits/men/44.jpg'
        },
        {
            username: 'rutaj',
            realname: 'Ruta Jankauskaitė',
            age: '26',
            gender: 'female',
            phone: '+37066789012',
            email: 'ruta@example.com',
            address: 'Alytus, Lithuania',
            photo: 'https://randomuser.me/api/portraits/women/55.jpg'
        },
        {
            username: 'tbal',
            realname: 'Tomas Baltakis',
            age: '40',
            gender: 'male',
            phone: '+37067890123',
            email: 'tomas@example.com',
            address: 'Marijampolė, Lithuania',
            photo: 'https://randomuser.me/api/portraits/men/66.jpg'
        }
    ]);

    const [form, setForm] = useState({
        username: '',
        realname: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        photo: ''
    });

    const [editingIndex, setEditingIndex] = useState(null);
    const [likeCounter, setLikeCounter] = useState(0);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addUser = () => {
        if (form.username && form.realname && form.email) {
            if (editingIndex !== null) {
                const updatedUsers = [...users];
                updatedUsers[editingIndex] = form;
                setUsers(updatedUsers);
                setEditingIndex(null);
            } else {
                setUsers([...users, form]);
            }
            setForm({
                username: '',
                realname: '',
                age: '',
                gender: '',
                phone: '',
                email: '',
                address: '',
                photo: ''
            });
        }
    };

    const deleteUser = (index) => {
        const filtered = users.filter((_, i) => i !== index);
        setUsers(filtered);
        if (editingIndex === index) {
            setEditingIndex(null);
            setForm({
                username: '',
                realname: '',
                age: '',
                gender: '',
                phone: '',
                email: '',
                address: '',
                photo: ''
            });
        }
    };

    const editUser = (index) => {
        setForm(users[index]);
        setEditingIndex(index);
    };

    const handleGlobalLike = () => {
        setLikeCounter(prev => prev + 1);
    };

    return (
        <div className="app-container">
            <h2>Like counter: {likeCounter}</h2>

            <div className="layout">
                <div className="form-section">
                    <h3>{editingIndex !== null ? 'Edit User' : 'Add User'}</h3>
                    <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
                    <input name="realname" placeholder="Real Name" value={form.realname} onChange={handleChange} />
                    <input name="age" placeholder="Age" value={form.age} onChange={handleChange} />
                    <select name="gender" value={form.gender} onChange={handleChange}>
                        <option value="">Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                    <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
                    <input name="photo" placeholder="Photo URL" value={form.photo} onChange={handleChange} />
                    <button onClick={addUser}>{editingIndex !== null ? 'Update' : 'Add User'}</button>
                </div>

                <div className="cards-grid">
                    {users.map((user, index) => (
                        <UserCard
                            key={index}
                            {...user}
                            onDelete={() => deleteUser(index)}
                            onEdit={() => editUser(index)}
                            onLike={handleGlobalLike}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;
