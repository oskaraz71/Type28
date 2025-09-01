import React, { useState } from 'react';
import './UserCard.css';

const UserCard = ({
                      username,
                      realname,
                      age,
                      gender,
                      phone,
                      email,
                      address,
                      photo,
                      onDelete,
                      onEdit,
                      onLike
                  }) => {
    const [localLikes, setLocalLikes] = useState(0);

    const handleLike = () => {
        setLocalLikes(prev => prev + 1);
        onLike();
    };

    return (
        <div className="user-card">
            <div className="user-left">
                <img src={photo} alt={username} className="user-img" />
                <button className="btn btn-like" onClick={handleLike}>
                    Like ({localLikes})
                </button>
            </div>

            <div className="user-info">
                <h3>{realname} ({username})</h3>
                <p><strong>Age:</strong> {age}</p>
                <p><strong>Gender:</strong> {gender}</p>
                <p><strong>Phone:</strong> {phone}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Address:</strong> {address}</p>

                <div className="user-actions">
                    <button className="btn btn-edit" onClick={onEdit}>Edit</button>
                    <button className="btn btn-delete" onClick={onDelete}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default UserCard;
