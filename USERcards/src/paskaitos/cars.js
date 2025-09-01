import './App.css';
import { useState } from 'react';

const initialCars = [
    {
        make: "Toyota",
        model: "Camry",
        year: 2021,
        color: "Silver",
        odometer: 23000,
        engine: "electric",
        image: "https://autoplius-img.dgn.lt/ann_25_362557415/toyota-corolla-1-8-l-universalas-2022-benzinas-elektra.jpg"
    },
    {
        make: "Tesla",
        model: "Model S",
        year: 2022,
        color: "Red",
        odometer: 10000,
        engine: "electric",
        image: "https://www.tesla.com/ownersmanual/images/GUID-B5641257-9E85-404B-9667-4DA5FDF6D2E7-online-en-US.png"
    },
    {
        make: "Ford",
        model: "Mustang",
        year: 2020,
        color: "Blue",
        odometer: 35000,
        engine: "gas",
        image: "https://cfwww.hgreg.com/photos/by-size/5186163/3648x2048/content.homenetiol.com_2001243_2195785_0x0_0de11328d5184b3389523cee0ebcb4ae.jpg"
    },
    {
        make: "BMW",
        model: "X5",
        year: 2019,
        color: "Black",
        odometer: 45000,
        engine: "diesel",
        image: "https://larte-design.com/storage/app/media/models/bmw/x5m-competition-front-site-carbon-gray-donington.webp"
    },
    {
        make: "Audi",
        model: "A4",
        year: 2018,
        color: "White",
        odometer: 50000,
        engine: "gas",
        image: "https://imgd.aeplcdn.com/642x336/n/cw/ec/51909/a4-exterior-right-front-three-quarter-2.jpeg?q=80"
    },
    {
        make: "Nissan",
        model: "Leaf",
        year: 2021,
        color: "Green",
        odometer: 15000,
        engine: "electric",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/2018_Nissan_Leaf_Tekna_Front.jpg/960px-2018_Nissan_Leaf_Tekna_Front.jpg"
    },
    {
        make: "Honda",
        model: "Civic",
        year: 2020,
        color: "Gray",
        odometer: 30000,
        engine: "gas",
        image: "https://carsguide-res.cloudinary.com/image/upload/f_auto,fl_lossy,q_auto,t_default/v1/editorial/honda-civic-sport-2006-1200x800.jpg"
    },
    {
        make: "Hyundai",
        model: "Elantra",
        year: 2017,
        color: "Yellow",
        odometer: 60000,
        engine: "gas",
        image: "https://crdms.images.consumerreports.org/c_lfill,w_563,q_auto,f_auto/prod/cars/chrome/white/2017HYC170001_1280_01"
    },
    {
        make: "Kia",
        model: "Sorento",
        year: 2019,
        color: "Purple",
        odometer: 40000,
        engine: "gas",
        image: "https://mkt-vehicleimages-prd.autotradercdn.ca/photos/chrome/Expanded/White/2019KIS020001/2019KIS02000101.jpg"
    },
    {
        make: "Chevrolet",
        model: "Bolt",
        year: 2022,
        color: "Teal",
        odometer: 12000,
        engine: "electric",
        image: "https://cdn.motor1.com/images/mgl/QjgAY/s1/2022-nissan-bolt-ev-review-exterior.jpg"
    },
    {
        make: "Volkswagen",
        model: "Golf",
        year: 2018,
        color: "Orange",
        odometer: 50000,
        engine: "diesel",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcCO1gc1PTKdmHP4W3juFGBf5wsCPPnBiJNg&s"
    },
    {
        make: "Mazda",
        model: "3",
        year: 2020,
        color: "Brown",
        odometer: 35000,
        engine: "gas",
        image: "https://media.hendy.co.uk/media/MAZDA/Thumbnails/Mazda3/D.4757_Hendy_Mazda_Model_Images_-_Mazda3_CentreLine.jpg.webp"
    },
    {
        make: "Renault",
        model: "Zoe",
        year: 2021,
        color: "Cyan",
        odometer: 20000,
        engine: "electric",
        image: "https://247.checkoutstore.co.uk/cars.checkoutstore.co.uk/variants/1449/1aac127c1b0949d18a70368f61f4bf16.webp"
    },
    {
        make: "Peugeot",
        model: "208",
        year: 2019,
        color: "Pink",
        odometer: 30000,
        engine: "gas",
        image: "https://scalethumb.leparking.fr/unsafe/331x248/smart/https://cloud.leparking.fr/2022/03/05/22/31/peugeot-208-1-2-petrol-gt-line-automatic-blanc_8443187884.jpg"
    },
    {
        make: "Skoda",
        model: "Octavia",
        year: 2021,
        color: "Beige",
        odometer: 22000,
        engine: "gas",
        image: "https://i.pinimg.com/736x/ce/a8/50/cea85045ca3499861f3a9c4d2131bdec.jpg"
    },
    {
        make: "Volvo",
        model: "XC60",
        year: 2023,
        color: "Navy",
        odometer: 5000,
        engine: "hybrid",
        image: "https://pictures.dealer.com/s/smythevolvovcna/0803/3bb1487d1bf9113f745e49e5a63ec6e2x.jpg?impolicy=downsize_bkpt&imdensity=1&w=520"
    },
];

function App() {
    const [cars, setCars] = useState(initialCars);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        make: '',
        model: '',
        year: '',
        color: '',
        odometer: '',
        engine: '',
        image: '',
    });

    function addCar() {
        const now = new Date();
        const created = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newCar = { ...form, created };
        setCars([...cars, newCar]);
        setForm({ make: '', model: '', year: '', color: '', odometer: '', engine: '', image: '' });
        setModalOpen(false);
    }


    function deleteCar(index) {
        const updated = [...cars];
        updated.splice(index, 1);
        setCars(updated);
    }

    return (
        <div className="container">
            <button className="add-button" onClick={() => setModalOpen(true)}>Add</button>

            {modalOpen && (
            <div className="modal">
             <div className="modal-content">
             {Object.keys(form).map((key) => (
             <input
                key={key}
               placeholder={key}
                 value={form[key]}
               onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            />
                        ))}
                <button onClick={addCar}>Add Car</button>
                    </div>
                </div>
            )}

            <div className="grid">
                {cars.map((car, index) => (
                    <div key={index} className="card">
                        <button className="delete" onClick={() => deleteCar(index)}>✕</button>
                        <img src={car.image} alt={car.make} />
                        <div>
                            <h3>{car.make} {car.model} ({car.year})</h3>
                            <p><strong>Color:</strong> {car.color}</p>
                            <p><strong>Odometer:</strong> {car.odometer} km</p>
                            <p><strong>Engine:</strong> {car.engine}</p>
                            <p style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '12px' }}>
                                Created: {car.created}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
