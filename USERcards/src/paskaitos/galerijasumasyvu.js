import React, { useState } from "react";
import "./App.css";

const images = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPrcJp9SICbrzY1BfPn6Q-Gqm-4f4mBEbLHQ&s",
    "https://t3.ftcdn.net/jpg/02/79/80/28/360_F_279802865_ShvuZmmaFXlhJy5EWRVEeAjqgKrQrOR9.jpg",
    "https://t4.ftcdn.net/jpg/00/68/02/29/360_F_68022902_xlIdUppCuvtLeZINtdDBqUnwSTjioiic.jpg",
    "https://soranews24.com/wp-content/uploads/sites/3/2013/12/hachiko3.jpg"
];

function App() {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    return (
        <div className="container">
            <div className="main-image">
                <img src={selectedImage} alt="Main" />
            </div>
            <div className="thumbs">
                {images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`Thumbnail ${idx}`}
                        className={`thumb ${selectedImage === img ? "selected" : ""}`}
                        onClick={() => setSelectedImage(img)}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;
