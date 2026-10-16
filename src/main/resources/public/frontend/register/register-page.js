/**
 * This script defines the registration functionality for the Registration page in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

/* 
 * TODO: Get references to various DOM elements
 * - usernameInput, emailInput, passwordInput, repeatPasswordInput, registerButton
 */
const recipeUserName = document.getElementById("username-input");
const recipeUserEmail = document.getElementById("email-input");
const userPasswordInput = document.getElementById("password-input");
const repeatPasswordInput = document.getElementById("repeat-password-input");


/* 
 * TODO: Ensure the register button calls processRegistration when clicked
 */
 signUpButton.addEventListener("click", processRegistration);

/**
 * TODO: Process Registration Function
 * 
 * Requirements:
 * - Retrieve username, email, password, and repeat password from input fields
 * - Validate all fields are filled
 * - Check that password and repeat password match
 * - Create a request body with username, email, and password
 * - Define requestOptions using method POST and proper headers
 * 
 * Fetch Logic:
 * - Send POST request to `${BASE_URL}/register`
 * - If status is 201:
 *      - Redirect user to login page
 * - If status is 409:
 *      - Alert that user/email already exists
 * - Otherwise:
 *      - Alert generic registration error
 * 
 * Error Handling:
 * - Wrap in try/catch
 * - Log error and alert user
 */
async function processRegistration() {
    // Implement registration logic here

     /* STEP 3 - Read and validate
     * CONCEPT: validation = a chain of early returns ("guard clauses").
     */

    if (!username || !email || !password || !repeatPassword) {
        alert("Fill everything in");
        return;
    }
    if (password !== repeatPassword) {
        alert("Passwords must match");
        return;
    }

    /* STEP 4 - Build the body (the code below needs a variable called registerBody)
     * CONCEPT: object shorthand - { username, email, password } is the same as
     * { username: username, email: email, password: password } when variable names match.
     * Do NOT send repeatPassword; the backend's Chef model has no such field.
     */
    // TODO: const registerBody = { ... }
    const registerBody = {username, email, password};

    const requestOptions = {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(registerBody)
    };
    // await fetch(...)

        try{
          const response = await fetch('{BASE_URL}/register', requestOptions);
          if (response.status===201){
            window.location.href = "../login/login-page.html"
          }else if(response.status ===409){
              alert("That username or email already exists");
          } else {
            alert("Registration failed. Please try again.")
          }

        } catch(error){

          console.error(error);
          alert("Could not reach the server. Is the backend running?");

        }
  
}
