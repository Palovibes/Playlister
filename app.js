const APIController = (function() {
    const clientId = '1f105464f62c4490abc6405efdefd56c';
    const clientSecret = '8f90024fef514d7fae9b59dcc44692b0';

    let accessToken;
    let expirationTime;

    const getToken = async () => {
        if (accessToken && Date.now() < expirationTime) {
            return accessToken;
        }

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        accessToken = data.access_token;
        expirationTime = Date.now() + data.expires_in * 1000;
        return accessToken;
    };

    return {
        getToken: getToken
    };
})();

$(document).ready(function() {
    $('#playlist-form').on('submit', async function(event) {
        event.preventDefault();

        try {
            const accessToken = await APIController.getToken();
            const artistName = $('input[name="search"]').val();
            const artistSearchURL = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`;

            const artistResponse = await fetch(artistSearchURL, {
                headers: { 'Authorization': 'Bearer ' + accessToken }
            });
            const artistData = await artistResponse.json();

            displayArtists(artistData.artists.items);
        } catch (error) {
            $('#error-message').text('Error: ' + error.message);
        }
    });
});

function displayArtists(artists) {
    $('#results').empty();

    artists.forEach(artist => {
        const artistCard = `
            <div class="result-card">
                <h3>${artist.name}</h3>
                <img src="${artist.images[0]?.url || 'default-image-url.jpg'}" alt="${artist.name}">
                <p>Followers: ${artist.followers.total.toLocaleString()}</p>
                <p>Genres: ${artist.genres.join(', ')}</p>
                <a href="${artist.external_urls.spotify}" target="_blank">View on Spotify</a>
            </div>
        `;
        $('#results').append(artistCard);
    });
}
