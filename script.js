// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBY8r6CsNCkNRa5dMKoRtzt-0X7bHKh9Yw",
  authDomain: "digital-menu-card-3f4e0.firebaseapp.com",
  projectId: "digital-menu-card-3f4e0",
  storageBucket: "digital-menu-card-3f4e0.appspot.com",
  messagingSenderId: "32686390107",
  appId: "1:32686390107:web:afe758258547115899787e",
  measurementId: "G-9WYWVDGPLL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set up Google Auth provider
const provider = new GoogleAuthProvider();

// DOM Elements
const googleAuthBtn = document.getElementById("google-auth-btn");
const logoutBtn = document.getElementById("logout-btn");
const addMenuBtn = document.getElementById("add-menu-btn");
const menuForm = document.getElementById("menu-form");
const updateMenuForm = document.getElementById("update-menu-form");
const menuCards = document.getElementById("menu-cards");

// Event Listener for Google Login
googleAuthBtn.addEventListener("click", handleGoogleLogin);

// Event Listener for Logout
logoutBtn.addEventListener("click", handleLogout);

// Event Listener for "Add Menu" Button
addMenuBtn.addEventListener("click", toggleMenuFormVisibility);

// Event Listener for Menu Form Submission
menuForm.addEventListener("submit", handleMenuFormSubmit);

// Event Listener for Update Menu Form Submission
updateMenuForm.addEventListener("submit", handleUpdateMenuFormSubmit);

// Handle Google Login
async function handleGoogleLogin() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();

    sessionStorage.setItem("idToken", idToken);
    toggleUI(true);
    fetchMenuItems(idToken);
    alert(`Welcome, ${user.displayName}!`);
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
    alert("Error during sign-in. Please try again.");
  }
}

// Handle Logout
async function handleLogout() {
  try {
    await signOut(auth);
    sessionStorage.removeItem("idToken");
    toggleUI(false);
    alert("You have logged out!");
  } catch (error) {
    console.error("Error logging out:", error.message);
    alert("Error during logout. Please try again.");
  }
}

// Toggle Add Menu Form Visibility
function toggleMenuFormVisibility() {
  menuForm.classList.toggle("hidden");
  menuForm.reset(); // Reset the form whenever it is toggled open
}

// Toggle Update Menu Form Visibility
function toggleUpdateFormVisibility() {
  updateMenuForm.classList.toggle("hidden");
  updateMenuForm.reset(); // Reset the form whenever it is toggled open
  delete updateMenuForm.dataset.id;
}

// Handle Add Menu Form Submission
async function handleMenuFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("menu-title").value.trim();
  const description = document.getElementById("menu-description").value.trim();
  const price = document.getElementById("menu-price").value.trim();
  const imageInput = document.getElementById("menu-image").files[0];

  if (!title || !description || !price || !imageInput) {
    alert("Please fill in all fields and upload an image.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("menu-image", imageInput);

  const idToken = sessionStorage.getItem("idToken");

  try {
    const response = await fetch("https://tap-and-taste.onrender.com/menu/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
      body: formData,
    });

    if (response.ok) {
      alert("Menu item added successfully!");
      menuForm.reset();
      menuForm.classList.add("hidden");
      fetchMenuItems(idToken);
    } else {
      const errorText = await response.text();
      console.error("Error adding menu item:", errorText);
      alert("Failed to add menu item.");
    }
  } catch (error) {
    console.error("Error adding menu item:", error.message);
    alert("Error adding menu item.");
  }
}

// Handle Update Menu Form Submission
// Handle Update Menu Form Submission
// DOM Element References
// const updateMenuForm = document.getElementById("update-menu-form");

// Handle Update Menu Form Submission
async function handleUpdateMenuFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("update-menu-title").value.trim();
  const description = document.getElementById("update-menu-description").value.trim();
  const price = document.getElementById("update-menu-price").value.trim();
  const imageInput = document.getElementById("update-menu-image").files[0];

  if (!title || !description || !price) {
    alert("Please fill in all fields.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price);
  if (imageInput) formData.append("menu-image", imageInput);

  const idToken = sessionStorage.getItem("idToken");
  const itemId = updateMenuForm.dataset.id; // Get the menu item ID from dataset

  if (!idToken || !itemId) {
    alert("Missing authentication or menu item ID.");
    return;
  }

  try {
    const response = await fetch(`https://tap-and-taste.onrender.com/menu/updateMenu/${itemId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${idToken}` },
      body: formData,
    });

    if (response.ok) {
      alert("Menu item updated successfully!");
      // Ensure this form reference is correct
      document.getElementById("update-menu-form").querySelector("form").reset();
      updateMenuForm.classList.add("hidden"); // Hide the form
      delete updateMenuForm.dataset.id; // Remove the item ID from dataset
      fetchMenuItems(idToken); // Refresh the menu items
    } else {
      const errorText = await response.text();
      console.error("Error updating menu item:", errorText);
      alert("Failed to update menu item.");
    }
  } catch (error) {
    console.error("Error updating menu item:", error.message);
    alert("Error updating menu item.");
  }
}



// Fetch and Display Menu Items
async function fetchMenuItems(idToken) {
  try {
    const response = await fetch("https://tap-and-taste.onrender.com/menu/getMenu", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      menuCards.innerHTML = ""; // Clear existing items

      data.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("menu-card");

        card.innerHTML = `
          <img src="${item.imageUrl}" alt="${item.title}" class="menu-card-img">
          <h4 class="menu-card-title">${item.title}</h4>
          <p class="menu-card-description">${item.description}</p>
          <span class="menu-card-price">$${item.price}</span>
        `;

        // Create Edit Button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("btn-secondary");
        editBtn.addEventListener("click", () =>
          handleEdit(item.id, item.title, item.description, item.price, item.imageUrl)
        );

        // Create Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("btn-danger");
        deleteBtn.addEventListener("click", () => handleDelete(item.id));

        // Add buttons to card
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("flex", "justify-between", "w-full", "mt-4");
        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);

        card.appendChild(buttonContainer);
        menuCards.appendChild(card);
      });
    } else {
      console.error("Failed to fetch menu items:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching menu items:", error.message);
  }
}

// Handle Edit Button
function handleEdit(id, title, description, price, imageUrl) {
  document.getElementById("update-menu-title").value = title;
  document.getElementById("update-menu-description").value = description;
  document.getElementById("update-menu-price").value = price;

  updateMenuForm.classList.remove("hidden");
  updateMenuForm.dataset.id = id;
}

// Handle Delete Button
async function handleDelete(id) {
  if (!confirm("Are you sure you want to delete this menu item?")) return;

  try {
    const response = await fetch(`https://tap-and-taste.onrender.com/menu/deleteMenu/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${sessionStorage.getItem("idToken")}` },
    });

    if (response.ok) {
      alert("Menu item deleted successfully!");
      fetchMenuItems(sessionStorage.getItem("idToken"));
    } else {
      const errorText = await response.text();
      console.error("Error deleting menu item:", errorText);
      alert("Failed to delete menu item.");
    }
  } catch (error) {
    console.error("Error deleting menu item:", error.message);
    alert("Error deleting menu item.");
  }
}

// Update UI on User State Change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const idToken = sessionStorage.getItem("idToken");
    if (idToken) {
      toggleUI(true);
      fetchMenuItems(idToken);
    }
  }
});

// Toggle UI based on user login state
function toggleUI(isLoggedIn) {
  document.getElementById("login-form").classList.toggle("hidden", isLoggedIn);
  document.getElementById("google-auth-btn").classList.toggle("hidden", isLoggedIn);
  document.getElementById("menu-container").classList.toggle("hidden", !isLoggedIn);
  document.getElementById("logout-btn").classList.toggle("hidden", !isLoggedIn);
}
