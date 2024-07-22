// Set API url and auth token
const apiUrl = 'http://localhost:1337/api/maaltijds?populate=*';
const authToken = 'Bearer 6b8a14ff34de7a73c211afff952e49d335121bd3ef9b91d4cf3a9d9683efeecb0534e33bb5400dff1caf0c738319e95cd7c84a9b8b43a512df87aaf9d01f531ab92c6ddb5951f5f09478fee89328a8ee2d4e8dfc348fe77caf87cc8dddfac1d374e4eec8ad6f50b9abc1b42f9bb6481642ecd456989aa35744c641c84404ca6c9b6e77551b28b5613ebddfcb48a7e4fc9fa220c2a000188c176f3fbb8620ff70a5e655800c9251bd176b87e9c60f04fb2cccdcd392400f98352974986e59dc04677f9ddadc1e72832180a07d6ba1c3a91aeb808a6ade32a5a18b1742b43a30a45875426d35b8f5ba188d92806d1592837091224a274ac949f54084d652d299b7';

// Create an array to store selected meal names
const selectedMeals = [];

// Function to add a selected meal to the list
function addSelectedMeal(mealName) {
    selectedMeals.push(mealName);
    updateSelectedMealsList();
}

// Function to update the selected meals list in the HTML
function updateSelectedMealsList() {
    const selectedMealsContainer = document.getElementById('selectedMealsContainer');
    const selectedMealsHTML = selectedMeals.map(mealName => {
        return `<span class="selected-meal">${mealName}</span>`;
    }).join('<span class="divider">and</span>');

    selectedMealsContainer.innerHTML = selectedMealsHTML;
}

// Show random order of results
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    console.log("shuffle array");

    return array;
}

// Initialize data variable
let data = null;

// Store the selected filters
let selectedFilters = {
    betaalbaar: true,
    gezond: true,
    snel: true,
    verwennerij: true
};

const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    filterAndDisplayMeals(data, searchTerm);
});

// Add event listeners to the filter buttons
document.getElementById('filter-betaalbaar').addEventListener('click', () => {
    selectedFilters.betaalbaar = !selectedFilters.betaalbaar;
    filterAndDisplayMeals(data, searchInput.value.trim().toLowerCase()); // Pass the searchTerm
    toggleActiveClass('filter-betaalbaar');
});

document.getElementById('filter-gezond').addEventListener('click', () => {
    selectedFilters.gezond = !selectedFilters.gezond;
    filterAndDisplayMeals(data, searchInput.value.trim().toLowerCase()); // Pass the searchTerm
    toggleActiveClass('filter-gezond');
});

document.getElementById('filter-snel').addEventListener('click', () => {
    selectedFilters.snel = !selectedFilters.snel;
    filterAndDisplayMeals(data, searchInput.value.trim().toLowerCase()); // Pass the searchTerm
    toggleActiveClass('filter-snel');
});

document.getElementById('filter-verwennerij').addEventListener('click', () => {
    selectedFilters.verwennerij = !selectedFilters.verwennerij;
    filterAndDisplayMeals(data, searchInput.value.trim().toLowerCase()); // Pass the searchTerm
    toggleActiveClass('filter-verwennerij');
});

// Function to toggle active class on filter buttons
function toggleActiveClass(buttonId) {
    const button = document.getElementById(buttonId);
    button.classList.toggle('active');
}

// Function to filter and display meals
function filterAndDisplayMeals(data, searchTerm) {

    // Clear error message on load
    messageContainer.innerHTML = '';

    // Show the loader
    const loader = document.getElementById('loader');
    loader.style.display = 'flex'; // Display the loader before fetching

    if (!data) {
        return; // Data not available yet
    }

    

 // Set a timeout to hide the loader after a minimum duration (0.5 seconds)
 setTimeout(function() {
    // Hide the loader
    loader.style.display = 'none';

    const filteredMeals = data.data.filter(meal => {
        const attributes = meal.attributes;
        const shouldDisplay =
            (selectedFilters.betaalbaar && attributes.cheap) ||
            (selectedFilters.gezond && attributes.healthy) ||
            (selectedFilters.snel && attributes.fast) ||
            (selectedFilters.verwennerij && attributes.verwennerij) ;

        // Check if the search term matches the meal name or description
        const searchTermMatch =
            attributes.naam.toLowerCase().includes(searchTerm) ||
            attributes.omschrijving.toLowerCase().includes(searchTerm);

        return shouldDisplay && (searchTerm === '' || searchTermMatch);
    });

    // Display error message if no filtered meals are available
    if (filteredMeals.length === 0) {
        messageContainer.innerHTML = 'Geen maaltijden gevonden, probeer andere zoekterm of filters.';
    }

    // Display filtered meals...
    const shuffledFilteredMeals = shuffleArray(filteredMeals); // Shuffle the filtered meals
        const mealsHTML = shuffledFilteredMeals.map(meal => {
        const attributes = meal.attributes;
        const smallThumbnailURL = (
            attributes.voorbeeld &&
            attributes.voorbeeld.data &&
            attributes.voorbeeld.data.attributes &&
            attributes.voorbeeld.data.attributes.formats &&
            attributes.voorbeeld.data.attributes.formats.small &&
            attributes.voorbeeld.data.attributes.formats.small.url
        ) ? attributes.voorbeeld.data.attributes.formats.small.url : attributes.voorbeeld.data.attributes.url;

        const categoryLabels = [];
        if (attributes.healthy) {
            categoryLabels.push('<li>Gezond</li>');
        }
        if (attributes.cheap) {
            categoryLabels.push('<li>Betaalbaar</li>');
        }
        if (attributes.fast) {
            categoryLabels.push('<li>Snel</li>');
        }
        if (attributes.verwennerij) {
            categoryLabels.push('<li>Verwennerij</li>');
        }

        return `
            <div class="meal-item__wrapper">
                <div class="meal-image-wrapper">
                    <img src="${smallThumbnailURL}" alt="Gerecht ${attributes.naam}">
                    <ul class="category-labels">
                        ${categoryLabels.join('')}
                    </ul>
                </div>
                <div class="meal-info-wrapper">
                    <h2>${attributes.naam}</h2>
                    <div class="short-description">${attributes.omschrijving}</div>
                </div>
            </div>
        `;
    }).join('');

    const mealsContainerHTML = `
        <div class="meals-container">
            ${mealsHTML}
        </div>
    `;

    dataContainer.innerHTML = mealsContainerHTML;
    
    // Add event listeners to the meal elements to select them
    const mealElements = document.querySelectorAll('.meal');

    mealElements.forEach(element => {
        console.log("event listeners test");
        console.log(mealElements);

        const mealName = element.getAttribute('data-meal-name');
        element.addEventListener('click', () => {
            addSelectedMeal(mealName);
        });
    });

    // Update the counter based on the number of filtered meals
    updateCounter(filteredMeals.length);

    const mealItemWrappers = document.querySelectorAll('.meal-item__wrapper');
    mealItemWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            // Toggle the "active" class on the clicked item
            wrapper.classList.toggle('active');
    
            const closestMealWrapper = wrapper.closest('.meal-item__wrapper');
    
            if (closestMealWrapper) {
                const mealTitleElement = closestMealWrapper.querySelector('h2');
                if (mealTitleElement) {
                    const mealTitle = mealTitleElement.textContent;
                    // Now you have the mealTitle from the H2 element inside the closest selector
                    updateSelectedMeals(mealTitle);
                } else {
                    // Handle the case where there is no H2 element inside mealName
                }
            } else {
                // Handle the case where closestMealWrapper is null
            }
        });
    });

}, 250); // 250 milliseconds
    // Function to update the counter
    function updateCounter(count) {
        const totalResultsElement = document.getElementById('totalResults');
        totalResultsElement.textContent = count;
        console.log("update counter");
    }
}

// Function to remove a selected meal by name
function removeSelectedMealByName(mealName) {
    const selectedMealsContainer = document.getElementById('selectedMealsContainer');
    const selectedMeals = selectedMealsContainer.querySelectorAll('.selected-meal');
    console.log("Remove selected meal");

    selectedMeals.forEach(selectedMeal => {
        if (selectedMeal.textContent === mealName) {
            selectedMeal.remove();
        }
    });
}

// Function to update the selected meals list
function updateSelectedMeals(mealName) {
    const selectedMealsContainer = document.getElementById('selectedMealsContainer');
    const selectedMeals = selectedMealsContainer.querySelectorAll('.selected-meal');
    console.log("updateSelected start");

    // Check if mealName is already selected
    const isMealSelected = Array.from(selectedMeals).some(selectedMeal => {
        return selectedMeal.textContent === mealName;
    });

    if (isMealSelected) {
        // If meal is already selected, remove it
        removeSelectedMealByName(mealName);
    } else {
        if (selectedMeals.length === 0) {
            // Add the label before the first selected meal
            selectedMealsContainer.innerHTML = `<span class="label">Geselecteerde gerecht(en):</span>`;
            // Add the selected meal without a divider
            selectedMealsContainer.innerHTML += `<span class="selected-meal">${mealName}</span>`;
        } else {
            // Add the divider and selected meal
            selectedMealsContainer.innerHTML += `
                <span class="divider"> en</span>
                <span class="selected-meal">${mealName}</span>
            `;
        }
    }

    console.log("updateSelected end");
}


// Get the data

async function fetchDataAndDisplay() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                //'Authorization': authToken,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Network response was not ok (${response.status}): ${errorDetails}`);
        }

        data = await response.json();
        filterAndDisplayMeals(data, '');

    } catch (error) {
        console.error('Fetch error:', error);
        dataContainer.innerHTML = `Error fetching meal data: ${error.message}`;
    }
}

// Call the initial data fetch and display
async function fetchDataAndDisplay() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
               // Authorization: authToken
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok (2)');
            
        }
        
        // Store data
        data = await response.json();

        // Call filterAndDisplayMeals to initially display meals without filters
        filterAndDisplayMeals(data, '');


    } catch (error) {
        // Error when fetching data
        console.error('Fetch error:', error);
        dataContainer.innerHTML = 'Error fetching meal data.';
    }
}

document.addEventListener('DOMContentLoaded', () => {

    console.log("domcontent loaded");

    // Define refresh button
    const refreshButton = document.getElementById('refreshButton');

    // Add event listener to the refresh button
    refreshButton.addEventListener('click', fetchDataAndDisplay);

    // Call the initial data fetch and display
    fetchDataAndDisplay();

    document.getElementById('sortByNew').addEventListener('click', () => {
        // Sort the data by the "id" property in ascending order
        data.data.sort((b, a) => {
            return a.id - b.id;
        });
    
        // Call the filterAndDisplayMeals function to update the displayed meals
        filterAndDisplayMeals(data, searchInput.value.trim().toLowerCase());
    });
    
});

function addClickListeners() {
    // Event listener for .meal-item__wrapper clicks
    const mealItemWrappers = document.querySelectorAll('.meal-item__wrapper');
    mealItemWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            wrapper.classList.toggle('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', addClickListeners);