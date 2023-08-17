const apiUrl = 'http://localhost:1337/api/maaltijds?populate=voorbeeld.name';
const authToken = 'Bearer 89ec6a0b5366e96955a1ae5610f7edbcae3c590ad2a4be5e79e72f23c0ae2ec5bb1b18b08b66250018f99a4f6b11d315b8fa92c7e5c11670d4cf3d4d5650bf17ee6e065fb3e2bce38abf7012e33ad691545590c957adb740657ec1a3a94c85e5e804280de0c98ce5dc92460af989b5d62344fab784a97fce8eaf3e5633518944';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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

        const data = await response.json();
        const dataContainer = document.getElementById('dataContainer');

        if (data && data.data && data.data.length > 0) {
            const shuffledMeals = shuffleArray(data.data);

            const mealsHTML = shuffledMeals.map(meal => {
                const attributes = meal.attributes;
                const recipeMarkdown = attributes.recipe || '';
                const imageURL = attributes.voorbeeld.data.attributes.url;

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
                            <img src="${imageURL}" alt="Gerecht ${attributes.naam}">
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
        } else {
            dataContainer.innerHTML = 'No meals available.';
        }

    } catch (error) {
        console.error('Fetch error:', error);
        dataContainer.innerHTML = 'Error fetching meal data.';
    }
}

document.addEventListener('DOMContentLoaded', fetchData);

document.addEventListener('DOMContentLoaded', () => {
    const refreshButton = document.getElementById('refreshButton');

    // Add event listener to refresh button
    refreshButton.addEventListener('click', fetchData);

    // Fetch data initially
    fetchData();
});