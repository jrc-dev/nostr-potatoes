// Copyright (C) 2017-2023 Smart code 203358507
// Copyright JRC DEV 2017-2023
function Tmdb() {
    this.getTmdbIdFromImdbId = async function(imdbId, apiKey="cb71e9b77e235cc81545a65d11a19ebb") {
        const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id&api_key=${apiKey}`;

        try {
            const response = await fetch(tmdbUrl);
            const data = await response.json();
            // Check if data was returned and has movie results
            if (data.movie_results && data.movie_results.length > 0) {
                return data.movie_results[0].id;
            }
            if (data.tv_results && data.tv_results.length > 0) {
                return data.tv_results[0].id;
            }
            if (data.tv_episode_results && data.tv_episode_results.length > 0) {
                return data.tv_episode_results[0].id;
            }
            if (data.tv_season_results && data.tv_season_results.length > 0) {
                return data.tv_season_results[0].id;
            }
            return null; // No matching result found
        } catch (error) {
            console.error("Error fetching TMDB ID:", error);
            return null;
        }
    }
}

module.exports = new Tmdb();