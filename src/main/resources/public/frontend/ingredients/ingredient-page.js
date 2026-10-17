/**
 * This script defines the add, view, and delete operations for Ingredient objects in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

/* 
 * TODO: Get references to various DOM elements
 * - addIngredientNameInput
 * - deleteIngredientNameInput
 * - ingredientListContainer
 * - searchInput (optional for future use)
 * - adminLink (if visible conditionally)
 */
const addIngredientNameInput = document.getElementById("add-ingredient-name-input");
const deleteIngredientNameInput = document.getElementById("delete-ingredient-name-input");
const ingredientListContainer = document.getElementById("ingredient-list");

/* 
 * TODO: Attach 'onclick' events to:
 * - "add-ingredient-submit-button" → addIngredient()
 * - "delete-ingredient-submit-button" → deleteIngredient()
 */
// Pass the function NAME (no parentheses) or it would run immediately on page load.
document.getElementById("add-ingredient-submit-button").addEventListener("click", addIngredient);
document.getElementById("delete-ingredient-submit-button").addEventListener("click", deleteIngredient);

/*
 * TODO: Create an array to keep track of ingredients
 */
// let, not const: the array is REPLACED each time we reload from the server.
let ingredients = [];

// Helper: JSON + Bearer token headers ("Bearer" followed by a space is required)
function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("auth-token")}`
    };
}

/* 
 * TODO: On page load, call getIngredients()
 */
getIngredients();


/**
 * TODO: Add Ingredient Function
 * 
 * Requirements:
 * - Read and trim value from addIngredientNameInput
 * - Validate input is not empty
 * - Send POST request to /ingredients
 * - Include Authorization token from sessionStorage
 * - On success: clear input, call getIngredients() and refreshIngredientList()
 * - On failure: alert the user
 */
async function addIngredient() {
    const name = addIngredientNameInput.value.trim();

    if (!name) {
        alert("Please enter an ingredient name");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/ingredients`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ name })
        });

        if (response.status === 201) {
            addIngredientNameInput.value = "";
            await getIngredients(); // getIngredients() already calls refreshIngredientList()
        } else if (response.status === 401) {
            alert("Only an admin can add ingredients");
        } else {
            alert("Could not add ingredient");
        }
    } catch (error) {
        console.error("Add ingredient error:", error);
        alert("Could not reach the server");
    }
}


/**
 * TODO: Get Ingredients Function
 * 
 * Requirements:
 * - Fetch all ingredients from backend
 * - Store result in `ingredients` array
 * - Call refreshIngredientList() to display them
 * - On error: alert the user
 */
async function getIngredients() {
    try {
        const response = await fetch(`${BASE_URL}/ingredients`);

        if (response.ok) { // ok = any 2xx status
            ingredients = await response.json(); // array of { id, name }
            refreshIngredientList();
        } else {
            alert("Could not load ingredients");
        }
    } catch (error) {
        console.error("Get ingredients error:", error);
        alert("Could not reach the server");
    }
}


/**
 * TODO: Delete Ingredient Function
 * 
 * Requirements:
 * - Read and trim value from deleteIngredientNameInput
 * - Search ingredientListContainer's <li> elements for matching name
 * - Determine ID based on index (or other backend logic)
 * - Send DELETE request to /ingredients/{id}
 * - On success: call getIngredients() and refreshIngredientList(), clear input
 * - On failure or not found: alert the user
 */
async function deleteIngredient() {
    const name = deleteIngredientNameInput.value.trim();

    if (!name) {
        alert("Please enter an ingredient name");
        return;
    }

    // The user types a NAME but the API needs an ID, so look it up first.
    // (Using the array's own `id` instead of the <li> index is simpler and less fragile.)
    const match = ingredients.find(
        (ingredient) => ingredient.name.toLowerCase() === name.toLowerCase()
    );

    if (!match) {
        alert("Ingredient not found");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/ingredients/${match.id}`, {
            method: "DELETE",
            headers: authHeaders()
        });

        if (response.status === 204) { // 204 No Content: no body, so don't call .json()
            deleteIngredientNameInput.value = "";
            await getIngredients();
        } else if (response.status === 401) {
            alert("Only an admin can delete ingredients");
        } else {
            alert("Could not delete ingredient");
        }
    } catch (error) {
        console.error("Delete ingredient error:", error);
        alert("Could not reach the server");
    }
}


/**
 * TODO: Refresh Ingredient List Function
 * 
 * Requirements:
 * - Clear ingredientListContainer
 * - Loop through `ingredients` array
 * - For each ingredient:
 *   - Create <li> and inner <p> with ingredient name
 *   - Append to container
 */
function refreshIngredientList() {
    ingredientListContainer.innerHTML = ""; // clear old items

    ingredients.forEach((ingredient) => {
        const li = document.createElement("li");
        const p = document.createElement("p");
        p.textContent = ingredient.name; // textContent is safe against HTML injection
        li.appendChild(p);
        ingredientListContainer.appendChild(li);
    });
}