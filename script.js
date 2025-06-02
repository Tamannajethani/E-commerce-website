window.global = window;

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth,signOut , createUserWithEmailAndPassword, signInWithEmailAndPassword ,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc,collection, setDoc, getDoc,getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

let app, auth, db, analytics;

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    analytics = getAnalytics(app);

    console.log("Firebase App Initialized:", app);
    console.log("Auth Instance:", auth);
    console.log("Firestore Instance:", db);
} catch (error) {
    console.error("Firebase initialization error: ", error);
    alert("Failed to connect to Firebase. Please check your Firebase setup.");
}

// Sign-up function
window.signup = async function signup() {
    let username = document.getElementById("new-username").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("new-password").value;
    let contact = document.getElementById("contact").value;
    let confirmPassword = document.getElementById("confirm-password").value;
    let errorMessage = document.getElementById("signup-error-message");

    // Clear previous error messages
    errorMessage.innerText = '';

    // Input validations
    if (!username || !email || !password || !confirmPassword || !contact) {
        errorMessage.innerText = "All fields are required!";
        return;
    }

    // Validate contact number (should be 10 digits)
    if (!/^\d{10}$/.test(contact)) {
        errorMessage.innerText = "Please enter a valid 10-digit contact number.";
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        errorMessage.innerText = "Passwords do not match!";
        return;
    }

    try {
        // Firebase Authentication Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            contact: contact,
            email: email,
            uid: user.uid
        });

        // Redirect to login after successful signup
        alert("Signup successful! Redirecting to login...");
        window.location.href = "index.html"; // Redirect to login page

    } catch (error) {
        console.error("Error during signup:", error);
        
        // Display detailed error messages
        if (error.code === 'auth/email-already-in-use') {
            errorMessage.innerText = "The email is already in use. Please try with another email.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage.innerText = "The email you entered is invalid. Please check and try again.";
        } else {
            errorMessage.innerText = "Error signing up: " + error.message;
        }

        // Firebase initialization error message
        if (error.message.includes('Firebase: Error (auth/configuration-not-found).')) {
            alert("Firebase initialization failed! Please ensure Firebase is properly configured.");
        }
    }
};

// Login function
window.login = async function login() {
    let email = document.getElementById("login-email").value;  // Update id to "login-email"
    let password = document.getElementById("login-password").value;  // Update id to "login-password"
    let errorMessage = document.getElementById("error-message");

    if (!email || !password) {
        errorMessage.innerText = "Please fill in both fields!";
        return;
    }

    try {
        // Firebase Authentication Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User Data from Firestore:", userData);
            alert("Login successful!");
            window.location.href = "shop.html";  // Redirect to the dashboard after login
        } else {
            errorMessage.innerText = "User does not exist in Firestore!";
        }
    } catch (error) {
        console.error("Login failed:", error);
        errorMessage.innerText = "Login failed: " + error.message;
    }
};
//slideshow
document.addEventListener('DOMContentLoaded', () => {
    let currentIndex = 0;
    const images = document.querySelectorAll('.home-image');  // Get all images
    const container = document.querySelector('.image-container');  // Get the image container

    // Position the images next to each other by setting their left position
    images.forEach((image, index) => {
        image.style.position = 'absolute';  // Ensure images are stacked on top of each other
        image.style.left = `${index * 100}%`;  // Position images side by side
    });

    // Function to slide the images
    const slideImages = () => {
        currentIndex = (currentIndex + 1) % images.length;  // Move to next image, loop back to first
        container.style.transition = "transform 1s ease-in-out";  // Add smooth transition for the container
        container.style.transform = `translateX(-${currentIndex * 100}%)`;  // Slide container by 100vw for each image
    };

    // Start the sliding immediately
    slideImages();

    // Change image every 5 seconds
    setInterval(slideImages, 5000);
});
// Profile dropdown toggle
document.addEventListener("DOMContentLoaded", () => {
    const profileToggle = document.getElementById("profile-toggle");
    const profileSection = document.getElementById("profile");

    profileToggle.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default behavior
        profileSection.classList.toggle("active");

        // Adjust visibility
        if (profileSection.classList.contains("active")) {
            profileSection.style.display = "block";
        } else {
            setTimeout(() => profileSection.style.display = "none", 300); // Delay for smooth transition
        }
    });

    // Close dropdown if clicked outside
    document.addEventListener("click", (event) => {
        if (!profileToggle.contains(event.target) && !profileSection.contains(event.target)) {
            profileSection.classList.remove("active");
            setTimeout(() => profileSection.style.display = "none", 300);
        }
    });
});





// Function to Fetch Profile Data from Firestore
function fetchUserProfile(userId) {
    const userRef = doc(db, "users", userId);  // Reference to Firestore document

    // Use getDoc to fetch the document data
    getDoc(userRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();  // Fetch data from Firestore document
                
                console.log("User Data fetched:", userData);

                // Populate the profile fields
                document.getElementById("profile-username").innerText = userData.username || "No Name";
                document.getElementById("profile-email").innerText = userData.email || "No Email";
                document.getElementById("profile-contact").innerText = userData.contact || "No Contact";
            } else {
                console.log("No user data available.");
            }
        })
        .catch((error) => {
            console.error("Error fetching user data:", error);
        });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);  // Log the user UID
        fetchUserProfile(user.uid);
    } else {
        console.log("User is not logged in.");
    }
});
document.getElementById("logout-btn").addEventListener("click", function(event) {
    event.preventDefault();  // Prevent the default behavior (e.g., form submission or page navigation)
    
    console.log("Logout button clicked!");
    logout();  // Call the logout function
});

function logout() {
    console.log("Logout function triggered");

    signOut(auth)
        .then(() => {
            console.log("User logged out successfully.");
            window.location.replace("index.html");  // Redirect to login page after logging out
        })
        .catch((error) => {
            console.error("Error logging out:", error);
            alert("There was an error logging out. Please try again.");
        });
}

async function loadCategories() {
    const categoryContainer = document.getElementById("category-container");
    categoryContainer.innerHTML = "";

    try {
        console.log("Fetching categories...");

        const querySnapshot = await getDocs(collection(db, "categories"));

        if (querySnapshot.empty) {
            console.warn("No categories found in Firestore.");
            categoryContainer.innerHTML = "<p>No categories available.</p>";
            return;
        }

        querySnapshot.forEach(doc => {
            let data = doc.data();
            console.log("Category:", doc.id, data); // Debugging

            let categoryDiv = document.createElement("div");
            categoryDiv.classList.add("category");
            categoryDiv.innerHTML = `
                <img src="${data.image || 'default.jpg'}" alt="${doc.id}">
                <p>${doc.id}</p>
            `;
            categoryDiv.onclick = () => showProducts(doc.id);
            categoryContainer.appendChild(categoryDiv);
        });

    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

async function showProducts(categoryName) {
    console.log(`Fetching products for category: ${categoryName}`); // Debugging Log

    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    try {
        // 🔹 Fetch from multiple product collections
        const productCollections = ["Product_id1", "product_id2", "Product_id3", "Product_id4", "Product_id5"];
        
        for (let collectionName of productCollections) {
            const productRef = collection(db, "categories", categoryName, collectionName);

            console.log(`Checking collection: categories/${categoryName}/${collectionName}`); // Debugging Log

            const productSnapshot = await getDocs(productRef);

            if (productSnapshot.empty) {
                console.warn(`⚠ No products found in ${collectionName} under ${categoryName}`);
                continue; // Skip empty collections
            }

            productSnapshot.forEach(doc => {
                console.log(`✅ Found Product in ${collectionName}:`, doc.id, doc.data()); // Debugging Log
                let product = doc.data();

                let productDiv = document.createElement("div");
                productDiv.classList.add("product");
                productDiv.innerHTML = `
                    <img src="${product.image}" alt="${doc.id}">
                    <p>${doc.id}</p>
                    <p>Price: ${product.price}</p>
                    <p>Quantity: ${product.quantity}</p>
                    <button onclick="addToCart('${doc.id}', '${product.image}', '${product.price}', '${product.quantity}')">Add to Cart</button>
                `;
                productList.appendChild(productDiv);
            });
        }
    } catch (error) {
        console.error("🚨 Error fetching products:", error);
    }
}


document.addEventListener("DOMContentLoaded", loadCategories); 
document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", (event) => {
        const id = event.target.getAttribute("data-id");
        const image = event.target.getAttribute("data-image");
        const price = parseFloat(event.target.getAttribute("data-price")); // Ensure price is a number
        addToCart(id, image, price);
    });
});
// ✅ Define addToCart FIRST
window.addToCart = function(name, image, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ name, image, price });
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Product added to cart:", { name, image, price });
};



// ✅ Make sure this runs AFTER the function is defined
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart")) {
            const id = event.target.getAttribute("data-id");
            const image = event.target.getAttribute("data-image");
            const price = parseFloat(event.target.getAttribute("data-price"));
            addToCart(id, image, price);
        }
    });
});

// ✅ Function to display cart items
function displayCart() {
    console.log("displayCart function is running!");
    
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartContainer = document.getElementById("cart-container");

    if (!cartContainer) {
        console.error("Cart container not found!");
        return;
    }

    cartContainer.innerHTML = ""; // Clear previous content
    let totalAmount = 0; // Initialize total amount

    cart.forEach((item, index) => {
        let itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");

        // ✅ Ensure the name, price, and quantity are correctly retrieved
        let itemName = item.name ? item.name : "Unnamed Item";
        let itemPrice = item.price ? parseFloat(item.price.replace(/[₹,]/g, "")) : 0;
        let itemQuantity = item.quantity ? parseInt(item.quantity) : 1;

        totalAmount += itemPrice * itemQuantity; // Calculate total price

        itemDiv.innerHTML = `
            <p><strong>Item:</strong> ${itemName}</p>
            <p><strong>Price:</strong> ₹${itemPrice.toFixed(2)}</p>
            <p><strong>Quantity:</strong> ${itemQuantity}</p>
        `;
        cartContainer.appendChild(itemDiv);
    });

    // ✅ Display total amount
    let totalDiv = document.createElement("div");
    totalDiv.classList.add("cart-total");
    totalDiv.innerHTML = `<h3>Total Amount: ₹${totalAmount.toFixed(2)}</h3>`;
    cartContainer.appendChild(totalDiv);

    // ✅ Add Buy Now button
    let buyNowButton = document.getElementById("buy-now-btn");
    if (!buyNowButton) {
        buyNowButton = document.createElement("button");
        buyNowButton.innerText = "Buy Now";
        buyNowButton.id = "buy-now-btn";  // Give it an ID
        buyNowButton.classList.add("buy-now-btn");
        buyNowButton.onclick = buyNow;
        cartContainer.appendChild(buyNowButton);
    }

    console.log("Cart updated successfully!");
}

// ✅ Ensure the cart updates when the page loads
document.addEventListener("DOMContentLoaded", displayCart);
function buyNow() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        alert("Your cart is empty! Add items before purchasing.");
        return;
    }

    alert("Purchase successful! Your cart has been cleared.");
    localStorage.removeItem("cart");  // Clear cart after buying

    displayCart();  // Refresh UI
}

