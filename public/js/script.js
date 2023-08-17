// Set API url and auth token
const apiUrl = 'http://localhost:1337/api/maaltijds?populate=*';
const authToken = 'Bearer 89ec6a0b5366e96955a1ae5610f7edbcae3c590ad2a4be5e79e72f23c0ae2ec5bb1b18b08b66250018f99a4f6b11d315b8fa92c7e5c11670d4cf3d4d5650bf17ee6e065fb3e2bce38abf7012e33ad691545590c957adb740657ec1a3a94c85e5e804280de0c98ce5dc92460af989b5d62344fab784a97fce8eaf3e5633518944';

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

// Add event listeners to the filter buttons
document.getElementById('filter-betaalbaar').addEventListener('click', () => {
    selectedFilters.betaalbaar = !selectedFilters.betaalbaar;
    filterAndDisplayMeals(data);
    toggleActiveClass('filter-betaalbaar');
});

document.getElementById('filter-gezond').addEventListener('click', () => {
    selectedFilters.gezond = !selectedFilters.gezond;
    filterAndDisplayMeals(data);
    toggleActiveClass('filter-gezond');
});

document.getElementById('filter-snel').addEventListener('click', () => {
    selectedFilters.snel = !selectedFilters.snel;
    filterAndDisplayMeals(data);
    toggleActiveClass('filter-snel');
});
// Function to toggle active class on filter buttons
function toggleActiveClass(buttonId) {
    const button = document.getElementById(buttonId);
    button.classList.toggle('active');
}

// Function to filter and display meals
function filterAndDisplayMeals(data) {
    if (!data) {
        return; // Data not available yet
    }

    const filteredMeals = data.data.filter(meal => {
        const attributes = meal.attributes;
        const shouldDisplay =
            (selectedFilters.betaalbaar && attributes.cheap) ||
            (selectedFilters.gezond && attributes.healthy) ||
            (selectedFilters.snel && attributes.fast);

        return shouldDisplay;
    });

    if (filteredMeals.length === 0) {
        console.log("No meals available");
        dataContainer.innerHTML = 'No meals available.';
    }
        
    //console.log("Filtered Meals:", filteredMeals);

    // Display filtered meals
    const mealsHTML = filteredMeals.map(meal => {
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
    // Update the counter based on the number of filtered meals
    updateCounter(filteredMeals.length);

    // Function to update the counter
    function updateCounter(count) {
        const totalResultsElement = document.getElementById('totalResults');
        totalResultsElement.textContent = count;
        console.log("update counter");
    }
}

// Get the data
async function fetchData() {
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

        // Get totals
        const overviewTotalsElement = document.getElementById('overviewTotals');
        const totalResultsElement = document.getElementById('totalResults');

        // Find Overview container
        const dataContainer = document.getElementById('dataContainer');

        // Call filterAndDisplayMeals to initially display meals
        filterAndDisplayMeals(data);

        // If there are results, continue
        if (data && data.data && data.data.length > 0) {
            const shuffledMeals = shuffleArray(data.data);
            const totalResults = data.data.length;

            const mealsHTML = shuffledMeals.map(meal => {
                const attributes = meal.attributes;
                const recipeMarkdown = attributes.recipe || '';

                // Check if the necessary properties exist before accessing them
                const smallThumbnailURL = (
                    attributes.voorbeeld &&
                    attributes.voorbeeld.data &&
                    attributes.voorbeeld.data.attributes &&
                    attributes.voorbeeld.data.attributes.formats &&
                    attributes.voorbeeld.data.attributes.formats.small &&
                    attributes.voorbeeld.data.attributes.formats.small.url
                ) ? attributes.voorbeeld.data.attributes.formats.small.url : attributes.voorbeeld.data.attributes.url;

                // Set labels for each meal based on Bool values
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

                // Resturn meal items HTML with content 
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

            // Place meal items inside a Div container
            const mealsContainerHTML = `
                <div class="meals-container">
                    ${mealsHTML}
                </div>
            `;

            dataContainer.innerHTML = mealsContainerHTML;

            // Update total results
            totalResultsElement.textContent = totalResults;

        } else {
            // No results
            dataContainer.innerHTML = 'No meals available.';
        }

    } catch (error) {

        // Error when fetching data
        console.error('Fetch error:', error);
        dataContainer.innerHTML = 'Error fetching meal data.';
    }
}

// Call the initial data fetch and display
fetchData();

document.addEventListener('DOMContentLoaded', fetchData);

document.addEventListener('DOMContentLoaded', () => {
    // Define refresh button
    const refreshButton = document.getElementById('refreshButton');

    // Add event listener to refresh button
    refreshButton.addEventListener('click', fetchData);

    // Fetch data on first load
    fetchData();
});