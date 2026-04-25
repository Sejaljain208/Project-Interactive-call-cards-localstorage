// new cards create karne hai , data local storage main save karna hai 
// localStorage se hi cards ko show karna hai 
// buttons ko handle karna hai
// filters ko handle karna hai.

// =============================================
// ALL VARIABLE and DOCUMENT SELECTION
// =============================================

// select note-container , form btn- close , create note.
let addNote = document.querySelector("#add-note");
let formContainer = document.querySelector(".form-container");
let closeForm = document.querySelector(".closeForm");

let stack = document.querySelector(".stack");
let upbtn = document.querySelector("#move-up");
let downbtn = document.querySelector("#move-down");

// querySelector(gpt it for forms)
let form = document.querySelector("form");

// Form input fields selection
let imageUrlInput = document.querySelector('input[placeholder="https://example.com/photo.jpg"]');
let fullNameInput = document.querySelector('input[placeholder="Enter full name"]');
let homeTownInput = document.querySelector('input[placeholder="Enter home town"]');
let purposeInput = document.querySelector('input[placeholder="e.g. Quick appointment note"]');

// Category radio buttons selection
let categoryInputs = document.querySelectorAll('input[name="category"]');
let submitBtn = document.querySelector(".submit-btn");

// konsa card screen par dikh raha hai (current visible card index)
let currentIndex = 0;

// =============================================
// FILTER RELATED VARIABLES
// =============================================
let currentFilter = "all"; // 'all' or specific category name like 'Emergency', 'Important', etc.
let filteredTasks = []; // Store filtered tasks array based on selected filter

// =============================================
// HELPER FUNCTIONS
// =============================================

// Function to get background color based on category (for category badges)
function getCategoryColor(category) {
    switch(category) {
        case "Emergency":
            return "#dc2626"; // Red color for emergency
        case "Important":
            return "#7c3aed"; // Purple color for important
        case "Urgent":
            return "#ea580c"; // Orange color for urgent
        case "No Rush":
            return "#0d9488"; // Teal color for no rush
        default:
            return "#6b7280"; // Gray color as default
    }
}

// Function to get badge background color (lighter version)
function getBadgeBgColor(category) {
    switch(category) {
        case "Emergency":
            return "#fee2e2";
        case "Important":
            return "#f3e8ff";
        case "Urgent":
            return "#fff3e0";
        case "No Rush":
            return "#e0f2f1";
        default:
            return "#f3f4f6";
    }
}

// Function to get badge text color
function getBadgeTextColor(category) {
    switch(category) {
        case "Emergency":
            return "#dc2626";
        case "Important":
            return "#7c3aed";
        case "Urgent":
            return "#ea580c";
        case "No Rush":
            return "#0d9488";
        default:
            return "#6b7280";
    }
}

// =============================================
// LOCALSTORAGE FUNCTIONS
// =============================================

// save data in localStorage
function saveToLocalStorage(obj) {
    // purane localStorage ka data nikaloo , or push it as array
    if (localStorage.getItem("tasks") === null) {
        // agar data nhi hai , null hai localStorage
        let oldTask = [];
        oldTask.push(obj);
        localStorage.setItem("tasks", JSON.stringify(oldTask));
        // localStorage mai save huya
    }
    else {
        // localStorage mai phle se kuch hai
        let oldTask = localStorage.getItem("tasks");
        oldTask = JSON.parse(oldTask);
        oldTask.push(obj);
        localStorage.setItem("tasks", JSON.stringify(oldTask));
    }
}

// Function to get tasks from localStorage with current filter applied
function getFilteredTasks() {
    // Get all tasks from localStorage
    let allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    
    // Apply filter - if 'all' then return everything, else filter by category
    if (currentFilter === "all") {
        return allTasks;
    } else {
        return allTasks.filter(task => task.category === currentFilter);
    }
}

// =============================================
// FILTER UI FUNCTIONS
// =============================================

// Function to setup and update filters
function setupFilters() {
    // Get all tasks from localStorage
    let allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    
    // Create a Set of unique categories from all tasks
    let categories = new Set(allTasks.map(task => task.category));
    
    // Get or create filter container
    let filterContainer = document.querySelector(".filter-container");
    if (!filterContainer) {
        filterContainer = document.createElement("div");
        filterContainer.classList.add("filter-container");
        
        // Insert filter container before the stack
        const noteContainer = document.querySelector(".note-container");
        const stackElement = document.querySelector(".stack");
        noteContainer.insertBefore(filterContainer, stackElement);
    }
    
    // Clear existing filters
    filterContainer.innerHTML = "";
    
    // Add "All" filter button
    let allFilterBtn = document.createElement("button");
    allFilterBtn.classList.add("filter-btn");
    allFilterBtn.setAttribute("data-filter", "all");
    allFilterBtn.textContent = `All (${allTasks.length})`;
    
    allFilterBtn.addEventListener("click", function() {
        currentFilter = "all";
        updateFilterButtons();
        currentIndex = 0;
        showCards();
    });
    
    filterContainer.appendChild(allFilterBtn);
    
    // Add filter buttons for each unique category
    categories.forEach(category => {
        const count = allTasks.filter(task => task.category === category).length;
        let filterBtn = document.createElement("button");
        filterBtn.classList.add("filter-btn");
        filterBtn.setAttribute("data-filter", category);
        filterBtn.textContent = `${category} (${count})`;
        filterBtn.style.backgroundColor = getCategoryColor(category);
        
        filterBtn.addEventListener("click", function() {
            currentFilter = category;
            updateFilterButtons();
            currentIndex = 0;
            showCards();
        });
        
        filterContainer.appendChild(filterBtn);
    });
}

// Function to update filter buttons UI (highlight active filter)
function updateFilterButtons() {
    // Get all filter buttons
    const filterBtns = document.querySelectorAll(".filter-btn");
    
    filterBtns.forEach(btn => {
        // Check if this button represents the current filter
        if (btn.getAttribute("data-filter") === currentFilter) {
            // Highlight active filter button
            btn.classList.add("active");
        } else {
            // Remove highlight from inactive buttons
            btn.classList.remove("active");
        }
    });
}

// =============================================
// EVENT HANDLERS
// =============================================

// jab + par click ho (Open form)
addNote.addEventListener("click", function () {
    formContainer.style.display = "flex"; // Show the form container
});

// jab close btn par click ho (Close form)
closeForm.addEventListener("click", function () {
    formContainer.style.display = "none"; // Hide the form container
});

// jab create note par click ho (Form submission)
form.addEventListener("submit", function (dets) {
    dets.preventDefault(); // Prevent page refresh on form submit

    // =============================================
    // FORM VALIDATION - Check all fields are filled
    // =============================================
    
    // Get values and trim whitespace
    const imageValue = imageUrlInput.value.trim();
    const fullNameValue = fullNameInput.value.trim();
    const homeTownValue = homeTownInput.value.trim();
    const purposeValue = purposeInput.value.trim();

    let selected = false;
    let selectedCategory = "";

    // Check which category radio button is selected
    categoryInputs.forEach(function (radio) {
        if (radio.checked) {
            selected = true;
            selectedCategory = radio.nextElementSibling.textContent; // Get category text
        }
    });

    // Validation checks with alerts
    if (imageValue === "") {
        alert("please enter the URL of image.");
        return;
    }

    if (fullNameValue === "") {
        alert("please enter the name.");
        return;
    }

    if (homeTownValue === "") {
        alert("please enter the home town.");
        return;
    }

    if (purposeValue === "") {
        alert("please enter the purpose");
        return;
    }

    if (!selected) {
        alert("plz select a category ..");
        return;
    }

    // =============================================
    // SAVE DATA TO LOCALSTORAGE
    // =============================================
    
    // save data in localStorage
    saveToLocalStorage({
        imageUrl: imageValue,      // Profile image URL
        fullName: fullNameValue,   // Person's full name
        homeTown: homeTownValue,   // Home town
        purpose: purposeValue,     // Purpose/booking reason
        category: selectedCategory, // Category (Emergency, Important, etc.)
    });

    // Update filters after adding new card
    setupFilters();
    updateFilterButtons();
    
    // naya card create hone ke baad latest card hi show ho
    // Get filtered tasks and set index to show the newest card
    filteredTasks = getFilteredTasks();
    currentIndex = filteredTasks.length - 1; // Show the last (newest) card

    // Update the UI with new card
    showCards();

    // form reset after submit (clear all input fields)
    form.reset();

    // form close after submit
    formContainer.style.display = "none";
});

// =============================================
// CARD DISPLAY FUNCTION
// =============================================

// jo form mai data dale , vo show ho as a card 
function showCards() {
    // Get filtered tasks based on current filter
    filteredTasks = getFilteredTasks();

    // stack clean karo (remove existing cards)
    stack.innerHTML = "";

    // agar koi task nahi hai (no cards to display)
    if (filteredTasks.length === 0) {
        // Show empty state message
        const emptyMessage = document.createElement("div");
        emptyMessage.classList.add("empty-message");
        emptyMessage.innerHTML = "✨ No cards available.<br>Click '+' to add a new card.";
        emptyMessage.style.textAlign = "center";
        emptyMessage.style.padding = "60px 40px";
        emptyMessage.style.color = "#999";
        emptyMessage.style.fontSize = "16px";
        emptyMessage.style.background = "#f9f9f9";
        emptyMessage.style.borderRadius = "24px";
        emptyMessage.style.lineHeight = "1.5";
        stack.appendChild(emptyMessage);
        return;
    }

    // current index ko control karo (boundary checking)
    if (currentIndex >= filteredTasks.length) currentIndex = filteredTasks.length - 1;
    if (currentIndex < 0) currentIndex = 0;

    // current card nikaalo (get the card to display)
    let latestTask = filteredTasks[currentIndex];

    // =============================================
    // CREATE 3D STACK EFFECT LAYERS
    // =============================================
    
    // fake back layer 1 (bottom-most layer)
    let layer1 = document.createElement("div");
    layer1.classList.add("call-card");
    layer1.style.transform = "translateY(-8px) scale(0.98)";
    layer1.style.opacity = "0.35"; // Match your CSS opacity
    layer1.style.zIndex = "1";

    // fake back layer 2 (middle layer)
    let layer2 = document.createElement("div");
    layer2.classList.add("call-card");
    layer2.style.transform = "translateY(-4px) scale(0.99)";
    layer2.style.opacity = "0.7"; // Match your CSS opacity
    layer2.style.zIndex = "2";

    // main real card (top layer)
    let callCard = document.createElement("div");
    callCard.classList.add("call-card");
    callCard.style.zIndex = "3";

    // =============================================
    // CREATE CARD PROFILE IMAGE
    // =============================================
    
    let profileImg = document.createElement("img");
    profileImg.src = latestTask.imageUrl;
    profileImg.alt = "profile";
    
    // Handle image loading error (show placeholder if image fails to load)
    profileImg.onerror = function() {
        this.src = "https://via.placeholder.com/70x70?text=👤";
    };

    // =============================================
    // CREATE CARD CONTENT
    // =============================================
    
    let cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    // Person's name (heading)
    let heading = document.createElement("h3");
    heading.textContent = latestTask.fullName;

    // Category badge - improved design
    let categoryBadge = document.createElement("span");
    categoryBadge.classList.add("category-badge");
    categoryBadge.textContent = latestTask.category;
    categoryBadge.style.backgroundColor = getBadgeBgColor(latestTask.category);
    categoryBadge.style.color = getBadgeTextColor(latestTask.category);
    categoryBadge.style.border = `1px solid ${getCategoryColor(latestTask.category)}`;

    // First info row - Home town
    let infoRow1 = document.createElement("div");
    infoRow1.classList.add("info-row");

    let homeTownLabel = document.createElement("span");
    homeTownLabel.textContent = "🏠 Home town";
    homeTownLabel.style.fontWeight = "500";

    let homeTownValue = document.createElement("span");
    homeTownValue.textContent = latestTask.homeTown;
    homeTownValue.style.fontWeight = "500";
    homeTownValue.style.color = "#111";

    infoRow1.appendChild(homeTownLabel);
    infoRow1.appendChild(homeTownValue);

    // Second info row - Purpose/Booking
    let infoRow2 = document.createElement("div");
    infoRow2.classList.add("info-row");

    let purposeLabel = document.createElement("span");
    purposeLabel.textContent = "📝 Purpose";
    purposeLabel.style.fontWeight = "500";

    let purposeValue = document.createElement("span");
    purposeValue.textContent = latestTask.purpose;
    purposeValue.style.fontWeight = "500";
    purposeValue.style.color = "#111";

    infoRow2.appendChild(purposeLabel);
    infoRow2.appendChild(purposeValue);

    // =============================================
    // CREATE CARD ACTION BUTTONS
    // =============================================
    
    let cardActions = document.createElement("div");
    cardActions.classList.add("card-actions");

    // Call button
    let callBtn = document.createElement("button");
    callBtn.classList.add("call-btn");
    callBtn.innerHTML = `<i class="ri-phone-fill"></i> Call`;
    
    // Call button click handler
    callBtn.addEventListener("click", () => {
        alert(`📞 Calling ${latestTask.fullName}...`);
    });

    // Message button
    let msgBtn = document.createElement("button");
    msgBtn.classList.add("msg-btn");
    msgBtn.innerHTML = `<i class="ri-message-fill"></i> Message`;
    
    // Message button click handler
    msgBtn.addEventListener("click", () => {
        alert(`💬 Messaging ${latestTask.fullName}...`);
    });

    cardActions.appendChild(callBtn);
    cardActions.appendChild(msgBtn);

    // Assemble card content
    cardContent.appendChild(heading);
    cardContent.appendChild(categoryBadge);
    cardContent.appendChild(infoRow1);
    cardContent.appendChild(infoRow2);
    cardContent.appendChild(cardActions);

    // Assemble card
    callCard.appendChild(profileImg);
    callCard.appendChild(cardContent);

    // =============================================
    // ADD CARD COUNTER (shows current position)
    // =============================================
    
    let cardCounter = document.createElement("div");
    cardCounter.classList.add("card-counter");
    cardCounter.textContent = `${currentIndex + 1} / ${filteredTasks.length}`;
    cardCounter.style.textAlign = "center";
    cardCounter.style.marginTop = "20px";
    cardCounter.style.padding = "10px";
    cardCounter.style.color = "#999";
    cardCounter.style.fontSize = "14px";
    cardCounter.style.fontWeight = "500";
    
    // Append all layers to stack
    stack.appendChild(layer1);
    stack.appendChild(layer2);
    stack.appendChild(callCard);
    stack.appendChild(cardCounter);
}

// =============================================
// NAVIGATION BUTTON HANDLERS
// =============================================

// up button par previous card show ho
upbtn.addEventListener("click", function () {
    // Get current filtered tasks
    filteredTasks = getFilteredTasks();
    
    // Don't do anything if no cards exist
    if (filteredTasks.length === 0) return;

    // Move to previous card (decrease index)
    currentIndex--;
    
    // Loop to last card if we go before first
    if (currentIndex < 0) {
        currentIndex = filteredTasks.length - 1;
    }

    // Refresh the display
    showCards();
});

// down button par next card show ho
downbtn.addEventListener("click", function () {
    // Get current filtered tasks
    filteredTasks = getFilteredTasks();
    
    // Don't do anything if no cards exist
    if (filteredTasks.length === 0) return;

    // Move to next card (increase index)
    currentIndex++;
    
    // Loop to first card if we go beyond last
    if (currentIndex >= filteredTasks.length) {
        currentIndex = 0;
    }

    // Refresh the display
    showCards();
});

// =============================================
// DELETE FUNCTIONALITY (Right-click on card)
// =============================================

stack.addEventListener("contextmenu", function(e) {
    e.preventDefault(); // Prevent default right-click menu
    
    // Confirm before deleting
    if (confirm("❌ Delete this card?")) {
        // Get current filtered tasks
        filteredTasks = getFilteredTasks();
        
        // Check if there's a card to delete
        if (filteredTasks.length > 0 && filteredTasks[currentIndex]) {
            // Get all tasks from localStorage
            let allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
            const cardToDelete = filteredTasks[currentIndex];
            
            // Find the card in the complete tasks array
            const indexInAll = allTasks.findIndex(task => 
                task.imageUrl === cardToDelete.imageUrl && 
                task.fullName === cardToDelete.fullName &&
                task.homeTown === cardToDelete.homeTown
            );
            
            // If found, remove it
            if (indexInAll !== -1) {
                allTasks.splice(indexInAll, 1);
                localStorage.setItem("tasks", JSON.stringify(allTasks));
                
                // Re-setup filters after deletion
                setupFilters();
                updateFilterButtons();
                
                // Adjust current index if needed
                if (currentIndex >= filteredTasks.length - 1 && currentIndex > 0) {
                    currentIndex = filteredTasks.length - 2;
                }
                if (filteredTasks.length === 1) {
                    currentIndex = 0;
                }
                
                // Refresh the display
                showCards();
            }
        }
    }
});

// =============================================
// ADD FILTER BUTTON STYLES
// =============================================

// Add filter container styles dynamically
const filterStyles = document.createElement('style');
filterStyles.textContent = `
    .filter-container {
        display: flex;
        gap: 12px;
        padding: 20px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 20px;
    }
    
    .filter-btn {
        padding: 10px 24px;
        border: none;
        border-radius: 30px;
        background: #f0f0f0;
        color: #333;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .filter-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .filter-btn.active {
        background: #000;
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .empty-message {
        text-align: center;
        padding: 60px 40px;
        color: #999;
        font-size: 16px;
        background: #f9f9f9;
        border-radius: 24px;
        line-height: 1.5;
    }
    
    .category-badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin: 8px 0 16px;
        letter-spacing: 0.5px;
    }
`;
document.head.appendChild(filterStyles);

// =============================================
// INITIALIZATION - Run when page loads
// =============================================

function init() {
    showCards();          // Display existing cards from localStorage
    setupFilters();      // Create filter buttons based on existing categories
    updateFilterButtons(); // Highlight active filter
}

// Call init when page loads
init();