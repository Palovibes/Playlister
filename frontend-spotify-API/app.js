const APIController = (function () {
    // Define the Spotify API client credentials
    const clientId = '1f105464f62c4490abc6405efdefd56c';
    const clientSecret = '8f90024fef514d7fae9b59dcc44692b0';

    // Variables to store the access token and its expiration time
    let accessToken;
    let expirationTime;

    // Function to get the access token from Spotify
    const getToken = async () => {
        // If we have a valid access token and it hasn't expired, return it
        if (accessToken && Date.now() < expirationTime) {
            return accessToken;
        }

        // Otherwise, make a request to Spotify to obtain a new access token
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        // Parse the response and store the new access token and its expiration time
        const data = await result.json();
        accessToken = data.access_token;
        expirationTime = Date.now() + data.expires_in * 1000;
        return accessToken;
    };

    // Expose the getToken function as a public method of the APIController
    return {
        getToken: getToken
    };
})();

$(document).ready(function () {
    // When the document is ready, handle form submission
    $('#playlist-form').on('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        try {
            // Get the access token using the getToken function from APIController
            const accessToken = await APIController.getToken();

            // Get the artist name from the input field
            const artistName = $('input[name="search"]').val();

            // Create the URL for searching artists on Spotify
            const artistSearchURL = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`;

            // Fetch artist data from Spotify using the access token
            const artistResponse = await fetch(artistSearchURL, {
                headers: { 'Authorization': 'Bearer ' + accessToken }
            });

            // Parse the artist data as JSON
            const artistData = await artistResponse.json();

            // Call the displayArtists function to show the search results
            displayArtists(artistData.artists.items);
        } catch (error) {
            // Display an error message if there's an error in the process
            $('#error-message').text('Error: ' + error.message);
        }
    });
});

// Function to display the list of artists
function displayArtists(artists) {
    // Clear the existing results
    $('#results').empty();

    // Loop through each artist and create a result card for them
    artists.forEach(artist => {
        // Create a result card for the current artist
        const artistCard = `
            <div class="result-card">
                <h3>${artist.name}</h3> <!-- Display the artist's name -->
                <img src="${artist.images[0]?.url || 'default-image-url.jpg'}" alt="${artist.name}">
                <!-- Display the artist's image (or a default image if not available) with alt text as the artist's name -->
                <p>Followers: ${artist.followers.total.toLocaleString()}</p>
                <!-- Display the number of followers for the artist -->
                <p>Genres: ${artist.genres.join(', ')}</p>
                <!-- Display the genres associated with the artist, joined by commas -->
                <a href="${artist.external_urls.spotify}" target="_blank">View on Spotify</a>
                <!-- Provide a link to view the artist on Spotify in a new tab -->
            </div>
        `;

        // Append the artist card to the results container
        $('#results').append(artistCard);
    });
}
