
import React, { useState, useEffect } from "react";
import "./App.css";

const foodItems = [
  { name: "Apple", emoji: "🍎" },
  { name: "Green Apple", emoji: "🍏" },
  { name: "Pear", emoji: "🍐" },
  { name: "Peach", emoji: "🍑" },
  { name: "Cherries", emoji: "🍒" },
  { name: "Strawberry", emoji: "🍓" },
  { name: "Blueberries", emoji: "🫐" },
  { name: "Kiwi", emoji: "🥝" },
  { name: "Tomato", emoji: "🍅" },
  { name: "Coconut", emoji: "🥥" },
  { name: "Pineapple", emoji: "🍍" },
  { name: "Mango", emoji: "🥭" },
  { name: "Banana", emoji: "🍌" },
  { name: "Watermelon", emoji: "🍉" },
  { name: "Grapes", emoji: "🍇" },
  { name: "Melon", emoji: "🍈" },
  { name: "Lemon", emoji: "🍋" },
  { name: "Avocado", emoji: "🥑" },
  { name: "Carrot", emoji: "🥕" },
  { name: "Corn", emoji: "🌽" },
  { name: "Broccoli", emoji: "🥦" },
  { name: "Cucumber", emoji: "🥒" },
  { name: "Leafy Green", emoji: "🥬" },
  { name: "Potato", emoji: "🥔" },
  { name: "Sweet Potato", emoji: "🍠" },
  { name: "Onion", emoji: "🧅" },
  { name: "Garlic", emoji: "🧄" },
  { name: "Mushroom", emoji: "🍄" },
  { name: "Bread", emoji: "🍞" },
  { name: "Pancakes", emoji: "🥞" },
  { name: "Cheese", emoji: "🧀" },
  { name: "Egg", emoji: "🥚" },
  { name: "Fried Egg", emoji: "🍳" },
  { name: "Bacon", emoji: "🥓" },
  { name: "Steak", emoji: "🥩" },
  { name: "Meat on Bone", emoji: "🍖" },
  { name: "Poultry Leg", emoji: "🍗" },
  { name: "Hot Dog", emoji: "🌭" },
  { name: "Hamburger", emoji: "🍔" },
  { name: "Fries", emoji: "🍟" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Sandwich", emoji: "🥪" },
  { name: "Taco", emoji: "🌮" },
  { name: "Burrito", emoji: "🌯" },
  { name: "Stuffed Flatbread", emoji: "🥙" },
  { name: "Falafel", emoji: "🧆" },
  { name: "Spaghetti", emoji: "🍝" },
  { name: "Ramen", emoji: "🍜" }
];

function generateRecipe() {
  const rnd = (num) => Math.floor(Math.random() * num);
  const amountOfProducts = rnd(4) + 2;
  let recipe = [];
  for (let i = 0; i < amountOfProducts; i++) {
    const randomItem = foodItems[rnd(foodItems.length)];
    recipe.push(randomItem);
  }
  return {
    name: `Recipe #${Math.floor(Math.random() * 1000)}`,
    ingredients: recipe,
  };
}

function App() {
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [dishesServed, setDishesServed] = useState(0);

  useEffect(() => {
    setCurrentRecipe(generateRecipe());
  }, []);

  const handleItemClick = (item) => {
    if (selectedItems.length >= currentRecipe.ingredients.length) return;
    setSelectedItems((prev) => [...prev, item]);
  };

  const handleComplete = () => {
    const selectedNames = selectedItems.map((i) => i.name).sort();
    const recipeNames = currentRecipe.ingredients.map((i) => i.name).sort();
    const isMatch = JSON.stringify(selectedNames) === JSON.stringify(recipeNames);
    if (isMatch) {
      setDishesServed((prev) => prev + 1);
      setCurrentRecipe(generateRecipe());
      setSelectedItems([]);
    } else {
      alert("Wrong ingredients! Try again.");
    }
  };

  const clearTable = () => setSelectedItems([]);

  return (
    <div className="app">
      <h1>👨‍🍳 Restaurant Chef</h1>
      <div className="recipe-box">
        <h2>{currentRecipe?.name}</h2>
        <div className="recipe">
          {currentRecipe?.ingredients.map((item, i) => (
            <div key={i} className="recipe-slot">{item.emoji}</div>
          ))}
        </div>
        <p>Dishes served: {dishesServed}</p>
        <div className="plate">
          {selectedItems.map((item, idx) => (
            <div key={idx} className="slot">{item.emoji}</div>
          ))}
        </div>
        <div className="buttons">
          <button onClick={handleComplete}>Complete</button>
          <button onClick={clearTable}>Clear Table</button>
        </div>
      </div>
      <div className="grid">
        {foodItems.map((item, idx) => (
          <div key={idx} className="food" onClick={() => handleItemClick(item)}>
            {item.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
