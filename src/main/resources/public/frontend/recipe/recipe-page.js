/**
 * This script defines the CRUD operations for Recipe objects in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

let recipes = [];

// Wait for DOM to fully load before accessing elements
window.addEventListener("DOMContentLoaded", () => {

    /* 
     * TODO: Get references to various DOM elements
     * - Recipe name and instructions fields (add, update, delete)
     * - Recipe list container
     * - Admin link and logout button
     * - Search input
    */
    const addNameInput = document.getElementById("add-recipe-name-input");
    const addInstructionsInput = document.getElementById("add-recipe-instructions-input");
    const updateNameInput = document.getElementById("update-recipe-name-input");
    const updateInstructionsInput = document.getElementById("update-recipe-instructions-input");
    const deleteNameInput = document.getElementById("delete-recipe-name-input");
    const recipeListContainer = document.getElementById("recipe-list");
    const adminLink = document.getElementById("admin-link");
    const logoutButton = document.getElementById("logout-button");
    const searchInput = document.getElementById("search-input");

    // Buttons (needed for the event handlers below)
    const addButton = document.getElementById("add-recipe-submit-input");
    const updateButton = document.getElementById("update-recipe-submit-input");
    const deleteButton = document.getElementById("delete-recipe-submit-input");
    const searchButton = document.getElementById("search-button");

    /*
     * TODO: Show logout button if auth-token exists in sessionStorage
     */
    // getItem returns null when the key is missing, so a truthiness check works.
    if (sessionStorage.getItem("auth-token")) {
        logoutButton.style.display = "inline";
    }

    /*
     * TODO: Show admin link if is-admin flag in sessionStorage is "true"
     */
    // Stored as the STRING "true"/"false". "false" is truthy, so compare explicitly.
    if (sessionStorage.getItem("is-admin") === "true") {
        adminLink.style.display = "inline";
    }

    /*
     * TODO: Attach event handlers
     * - Add recipe button → addRecipe()
     * - Update recipe button → updateRecipe()
     * - Delete recipe button → deleteRecipe()
     * - Search button → searchRecipes()
     * - Logout button → processLogout()
     */
    addButton.addEventListener("click", addRecipe);
    updateButton.addEventListener("click", updateRecipe);
    deleteButton.addEventListener("click", deleteRecipe);
    searchButton.addEventListener("click", searchRecipes);
    logoutButton.addEventListener("click", processLogout);

    /*
     * TODO: On page load, call getRecipes() to populate the list
     */
    getRecipes();

    // Helper: JSON + Bearer token headers
    function authHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("auth-token")}`
        };
    }


    /**
     * TODO: Search Recipes Function
     * - Read search term from input field
     * - Send GET request with name query param
     * - Update the recipe list using refreshRecipeList()
     * - Handle fetch errors and alert user
     */
    async function searchRecipes() {
        const term = searchInput.value.trim();

        if (!term) {
            await getRecipes(); // empty search = show everything
            return;
        }

        try {
            // encodeURIComponent makes spaces, &, ? etc. safe inside a URL
            const response = await fetch(`${BASE_URL}/recipes?name=${encodeURIComponent(term)}`);

            if (response.status === 200) {
                recipes = await response.json();
            } else if (response.status === 404) {
                recipes = []; // 404 here just means "no matches"
            } else {
                alert("Search failed");
                return;
            }
            refreshRecipeList();
        } catch (error) {
            console.error("Search error:", error);
            alert("Could not reach the server");
        }
    }

    /**
     * TODO: Add Recipe Function
     * - Get values from add form inputs
     * - Validate both name and instructions
     * - Send POST request to /recipes
     * - Use Bearer token from sessionStorage
     * - On success: clear inputs, fetch latest recipes, refresh the list
     */
    async function addRecipe() {
        const name = addNameInput.value.trim();
        const instructions = addInstructionsInput.value.trim();

        if (!name || !instructions) {
            alert("Please enter both a name and instructions");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/recipes`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ name, instructions })
            });

            if (response.status === 201) {
                addNameInput.value = "";
                addInstructionsInput.value = "";
                await getRecipes(); // fetches latest AND refreshes the list
            } else if (response.status === 401) {
                alert("Please log in to add a recipe");
            } else {
                alert("Could not add recipe");
            }
        } catch (error) {
            console.error("Add recipe error:", error);
            alert("Could not reach the server");
        }
    }

    /**
     * TODO: Update Recipe Function
     * - Get values from update form inputs
     * - Validate both name and updated instructions
     * - Fetch current recipes to locate the recipe by name
     * - Send PUT request to update it by ID
     * - On success: clear inputs, fetch latest recipes, refresh the list
     */
    async function updateRecipe() {
        const name = updateNameInput.value.trim();
        const instructions = updateInstructionsInput.value.trim();

        if (!name || !instructions) {
            alert("Please enter both a name and new instructions");
            return;
        }

        try {
            await getRecipes(); // make sure our array is current before searching it

            // The user types a NAME but PUT needs an ID, so find the recipe first.
            const match = recipes.find((recipe) => recipe.name.toLowerCase() === name.toLowerCase());
            if (!match) {
                alert("Recipe not found");
                return;
            }

            const response = await fetch(`${BASE_URL}/recipes/${match.id}`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify({ name: match.name, instructions })
            });

            if (response.status === 200) {
                updateNameInput.value = "";
                updateInstructionsInput.value = "";
                await getRecipes();
            } else if (response.status === 404) {
                alert("Recipe not found");
            } else {
                alert("Could not update recipe");
            }
        } catch (error) {
            console.error("Update recipe error:", error);
            alert("Could not reach the server");
        }
    }

    /**
     * TODO: Delete Recipe Function
     * - Get recipe name from delete input
     * - Find matching recipe in list to get its ID
     * - Send DELETE request using recipe ID
     * - On success: refresh the list
     */
    async function deleteRecipe() {
        const name = deleteNameInput.value.trim();

        if (!name) {
            alert("Please enter a recipe name");
            return;
        }

        const match = recipes.find((recipe) => recipe.name.toLowerCase() === name.toLowerCase());
        if (!match) {
            alert("Recipe not found");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/recipes/${match.id}`, {
                method: "DELETE",
                headers: authHeaders()
            });

            // The backend only lets an ADMIN delete recipes (401 otherwise).
            if (response.status === 200) {
                deleteNameInput.value = "";
                await getRecipes();
            } else if (response.status === 401) {
                alert("Only an admin can delete recipes");
            } else if (response.status === 404) {
                alert("Recipe not found");
            } else {
                alert("Could not delete recipe");
            }
        } catch (error) {
            console.error("Delete recipe error:", error);
            alert("Could not reach the server");
        }
    }

    /**
     * TODO: Get Recipes Function
     * - Fetch all recipes from backend
     * - Store in recipes array
     * - Call refreshRecipeList() to display
     */
    async function getRecipes() {
        try {
            const response = await fetch(`${BASE_URL}/recipes`);

            if (response.status === 200) {
                recipes = await response.json();
            } else if (response.status === 404) {
                recipes = []; // 404 = the table is empty
            } else {
                alert("Could not load recipes");
                return;
            }
            refreshRecipeList();
        } catch (error) {
            console.error("Get recipes error:", error);
            alert("Could not reach the server");
        }
    }

    /**
     * TODO: Refresh Recipe List Function
     * - Clear current list in DOM
     * - Create <li> elements for each recipe with name + instructions
     * - Append to list container
     */
    function refreshRecipeList() {
        recipeListContainer.innerHTML = "";

        recipes.forEach((recipe) => {
            const li = document.createElement("li");
            li.textContent = `${recipe.name}: ${recipe.instructions}`;
            recipeListContainer.appendChild(li);
        });
    }

    /**
     * TODO: Logout Function
     * - Send POST request to /logout
     * - Use Bearer token from sessionStorage
     * - On success: clear sessionStorage and redirect to login
     * - On failure: alert the user
     */
    async function processLogout() {
        try {
            const response = await fetch(`${BASE_URL}/logout`, {
                method: "POST",
                headers: authHeaders()
            });

            if (response.status === 200) {
                sessionStorage.clear(); // removes auth-token and is-admin
                window.location.href = "../login/login-page.html";
            } else {
                alert("Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert("Could not reach the server");
        }
    }

});