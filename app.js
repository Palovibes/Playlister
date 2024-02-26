const APIController = (function () {
    // Spotify API client credentials
    const clientId = '1f105464f62c4490abc6405efdefd56c';
    const clientSecret = '8f90024fef514d7fae9b59dcc44692b0';

    // store the access token and its expiration time
    let accessToken;
    let expirationTime;

    // get the access token from Spotify
    const getToken = async () => {
        // if valid access token and not expired, return it
        if (accessToken && Date.now() < expirationTime) {
            return accessToken;
        }

        // Otherwise, make a request to Spotify to obtain a new access token
        const result = await fetch('https://accounts.spotify.com/api/token', {
            // context of OAuth 2.0 and the "Client Credentials Flow"     
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            // request access token server-server
            body: 'grant_type=client_credentials'
        });

        // parse response and store the new access token and its expiration time
        const data = await result.json();
        accessToken = data.access_token;
        expirationTime = Date.now() + data.expires_in * 1000;
        return accessToken;
    };

    // expose getToken function as a public method of the APIController
    return {
        getToken: getToken
    };
})();

$(document).ready(function () {
    // when the document is ready, handle form submission
    $('#playlist-form').on('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        try {
            // access token using the getToken function from APIController
            const accessToken = await APIController.getToken();
            console.log("Access Token:", accessToken); // Check if token is received

            // artist name from the input field
            const artistName = $('input[name="search"]').val();

            // URL for searching artists on Spotify
            const artistSearchURL = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`;

            // Fetch artist data from Spotify using the access token
            const artistResponse = await fetch(artistSearchURL, {
                headers: { 'Authorization': 'Bearer ' + accessToken }
            });

            // Parse artist data as JSON
            const artistData = await artistResponse.json();

            console.log("Artist Data:", artistData);


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
    $('#results').empty();

    artists.forEach(artist => {
        const artistCard = `
            <div class="card mb-3">
                <div class="row no-gutters">
                    <div class="col-md-4">
                        <img src="${artist.images[0]?.url || 'default-image-url.jpg'}" class="card-img" alt="${artist.name}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${artist.name}</h5>
                            <p class="card-text">Genres: ${artist.genres.join(', ')}</p>
                            <p class="card-text">Followers: ${artist.followers.total.toLocaleString()}</p>
                            <a href="${artist.external_urls.spotify}" target="_blank" class="btn btn-primary">View on Spotify</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#results').append(artistCard);
    });
}


// fetch artist id and associated genres using v1/ search end point and type set artist 
// find artists similar to the one i searched, or find the genres associated with the artist using /v1/artists/{id}/related-artists endpoint.
// playslist: /v1/browse/featured-playlists searching for playlists with keywords that match the artist's genres

// as a bonus i will like to also return who owns the playlist poc, numbers of playlist followers, genres, and last time it was updated.