// Set API url and auth token
const apiUrl = 'http://localhost:1337/api/maaltijds?populate=*';
const authToken = 'Bearer 89ec6a0b5366e96955a1ae5610f7edbcae3c590ad2a4be5e79e72f23c0ae2ec5bb1b18b08b66250018f99a4f6b11d315b8fa92c7e5c11670d4cf3d4d5650bf17ee6e065fb3e2bce38abf7012e33ad691545590c957adb740657ec1a3a94c85e5e804280de0c98ce5dc92460af989b5d62344fab784a97fce8eaf3e5633518944';


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
    return array;
}

// Initialize data variable
let data = null;

// Store the selected filters
let selectedFilters = {
    betaalbaar: true,
    gezond: true,
    snel: true
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
            (selectedFilters.snel && attributes.fast);

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

    console.log('Filtered meals:', filteredMeals); // Add this line to log filtered meals

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
    console.log(mealElements);

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
            const mealName = wrapper.closest('.meal').dataset.mealName;
            updateSelectedMeals(mealName);
        });
    });

}, 500); // 500 milliseconds
    // Function to update the counter
    function updateCounter(count) {
        const totalResultsElement = document.getElementById('totalResults');
        totalResultsElement.textContent = count;
        console.log("update counter");
    }
}

// Function to update the selected meals list
function updateSelectedMeals(mealName) {
    const selectedMealsContainer = document.getElementById('selectedMealsContainer');
    const selectedMeals = selectedMealsContainer.querySelectorAll('.selected-meal');

    if (selectedMeals.length === 0) {
        selectedMealsContainer.innerHTML = `<span class="selected-meal">${mealName}</span>`;
    } else if (selectedMeals.length === 1) {
        selectedMealsContainer.innerHTML += `
            <span class="divider"> and </span>
            <span class="selected-meal">${mealName}</span>
        `;
    } else {
        const lastSelectedMeal = selectedMeals[selectedMeals.length - 1];
        lastSelectedMeal.insertAdjacentHTML('afterend', `
            <span class="divider"> and </span>
            <span class="selected-meal">${mealName}</span>
        `);
    }
}

// Get the data

async function fetchData() {
    try {
        const loader = document.getElementById('loader');
        loader.style.display = 'flex'; // Display the loader before fetching

        // Find Overview container
        const dataContainer = document.getElementById('dataContainer');
        const messageContainer = document.getElementById('messageContainer');
        const selectedMealsContainer = document.getElementById('selectedMeals');

        const response = await fetch(apiUrl, {
            headers: {
                Authorization: authToken
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log("pre-pre-pre-results");
        // Store data
        data = await response.json();
        console.log("pre-pre-results")

    } catch (error) {
        // Error when fetching data
        console.error('Fetch error:', error);
        dataContainer.innerHTML = 'Error fetching meal data.';
        // Hide the loader in case of an error
        const loader = document.getElementById('loader');
        loader.style.display = 'none';
    }
}

// Call the initial data fetch and display
async function fetchDataAndDisplay() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: authToken
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Store data
        data = await response.json();
        console.log('Fetched data:', data); // Add this line
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
});