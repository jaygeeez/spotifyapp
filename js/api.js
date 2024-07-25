// var redirect_uri = "https://makeratplay.github.io/SpotifyWebAPI/"; // change this your value
var redirect_uri = "http://127.0.0.1:5500";
//var redirect_uri = "https://jaygeeez.github.io/spotifyapp/index";

var client_id = "b0967dcab86e44698289a22765cf49dc";
var client_secret = "14aa4e5fce0443a4a4bca54c5ba51ba2"; // In a real app you should not expose your client_secret to the user

var access_token = null;
var refresh_token = null;

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
// const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
// const DEVICES = "https://api.spotify.com/v1/me/player/devices";
// const PLAY = "https://api.spotify.com/v1/me/player/play";
// const PAUSE = "https://api.spotify.com/v1/me/player/pause";
// const NEXT = "https://api.spotify.com/v1/me/player/next";
// const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
// const PLAYER = "https://api.spotify.com/v1/me/player";
// const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
// const CURRENTLYPLAYING =
//   "https://api.spotify.com/v1/me/player/currently-playing";
// const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";

function onPageLoad() {
  // client_id = localStorage.getItem("client_id");
  // client_secret = localStorage.getItem("client_secret");
  if (window.location.search.length > 0) {
    handleRedirect();
  } else {
    access_token = localStorage.getItem("access_token");
    if (access_token == null) {
      // we don't have an access token so present token section
      document.getElementById("tokenSection").style.display = "block";
    } else {
      // we have an access token so present device section
      document.getElementById("deviceSection").style.display = "block";
      callQuestion();
    }
  }
}

function handleRedirect() {
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("", "", redirect_uri); // remove param from url
}

function getCode() {
  let code = null;
  const queryString = window.location.search;
  if (queryString.length > 0) {
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get("code");
  }
  return code;
}

function requestAuthorization() {
  //localStorage.setItem("client_id", client_id);
  //localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

  let url = AUTHORIZE;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialog=true";
  url += "&scope=user-library-read";
  //url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken(code) {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secret=" + client_secret;
  callAuthorizationApi(body);
}

function refreshAccessToken() {
  refresh_token = localStorage.getItem("refresh_token");
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refresh_token;
  body += "&client_id=" + client_id;
  callAuthorizationApi(body);
}

function callAuthorizationApi(body) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader(
    "Authorization",
    "Basic " + btoa(client_id + ":" + client_secret)
  );
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    var data = JSON.parse(this.responseText);
    if (data.access_token != undefined) {
      access_token = data.access_token;
      localStorage.setItem("access_token", access_token);
    }
    if (data.refresh_token != undefined) {
      refresh_token = data.refresh_token;
      localStorage.setItem("refresh_token", refresh_token);
    }
    onPageLoad();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + access_token);
  xhr.send(body);
  xhr.onload = callback;
}

function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

var correct_artist;
var correct_album;
var correct_track;
var album_Track;
var score = 0;

function callQuestion(id = "option_1") {
  if (
    document.getElementById(id).innerHTML == correct_artist ||
    document.getElementById(id).innerHTML == correct_album ||
    document.getElementById(id).innerHTML == correct_track
  ) {
    score += 1;
  }

  // Determine which of the 3 questions are chosen
  let randomQuestion = getRandomNum(1, 4);
  console.log(randomQuestion);
  if (randomQuestion == 1) {
    whichArtist();
  } else if (randomQuestion == 2) {
    whichAlbum();
  } else if (randomQuestion == 3) {
    whichTopTrack();
  }
}

function whichArtist() {
  fetch("https://api.spotify.com/v1/me/tracks?market=CA&limit=50", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
    },
  })
    .then((response) => response.json())
    .then((response) => {
      // Random Number Thing
      let correct_number = getRandomNum(0, 49);
      correct_artist = getArtist(response, correct_number);
      let artists = [];
      artists.push(correct_artist);

      // Repeat until there are four total answers
      while (artists.length < 4) {
        let wrong_number = getRandomNum(0, 49);

        // Doesn't let the right answer appear twice
        if (!artists.includes(getArtist(response, wrong_number))) {
          artists.push(getArtist(response, wrong_number));
        }
      }

      shuffle(artists);
      let song_title = JSON.stringify(
        response.items[correct_number].track.name
      );

      document.getElementById("score").innerHTML = "Score: " + score;

      // Who is the artist of song
      document.getElementById("song_text").innerHTML =
        "Who is the artist of: " + song_title + "?";
      document.getElementById("option_1").innerHTML = artists[0];
      document.getElementById("option_2").innerHTML = artists[1];
      document.getElementById("option_3").innerHTML = artists[2];
      document.getElementById("option_4").innerHTML = artists[3];
    });
}

function whichAlbum() {
  fetch("https://api.spotify.com/v1/me/albums?limit=50", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
    },
  })
    .then((response) => response.json())
    .then((response) => {
      // Random Number Thing
      let correct_number = getRandomNum(0, 49);
      correct_album = getAlbum(response, correct_number);
      let albums = [];
      albums.push(correct_album);

      // Repeat until there are four total answers
      while (albums.length < 4) {
        let wrong_number = getRandomNum(0, 49);

        // Doesn't let the right answer appear twice
        if (!albums.includes(getAlbum(response, wrong_number))) {
          albums.push(getAlbum(response, wrong_number));
        }
      }

      shuffle(albums);

      let song_title = JSON.stringify(getAlbumTrack(response, correct_number));

      document.getElementById("score").innerHTML = "Score: " + score;

      // What is the album of the song
      document.getElementById("song_text").innerHTML =
        "Which album is: " + song_title + " from?";
      document.getElementById("option_1").innerHTML = albums[0];
      document.getElementById("option_2").innerHTML = albums[1];
      document.getElementById("option_3").innerHTML = albums[2];
      document.getElementById("option_4").innerHTML = albums[3];
    });
}

function whichTopTrack() {
  fetch("https://api.spotify.com/v1/me/tracks?market=CA&limit=50", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
    },
  })
    .then((response) => response.json())
    .then((response) => {
      // get artists from profile tracks, use artists id to find their top tracks

      // Random Number Thing
      let random_number = getRandomNum(0, 49);
      random_artist = response.items[random_number].track.artists[0].name;
      random_id = response.items[random_number].track.artists[0].id;
      let topTracks = [];

      let tracks_url =
        "https://api.spotify.com/v1/artists/" +
        random_id +
        "/top-tracks?market=CA";

      fetch(tracks_url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          for (var i = 0; i < 4; i++) {
            topTracks.push(response.tracks[i].name);
          }

          correct_artist = topTracks[0];
          shuffle(topTracks);

          document.getElementById("score").innerHTML = "Score: " + score;

          // Who is the artist of song
          document.getElementById("song_text").innerHTML =
            "What is: " + random_artist + "'s top track?";
          document.getElementById("option_1").innerHTML = topTracks[0];
          document.getElementById("option_2").innerHTML = topTracks[1];
          document.getElementById("option_3").innerHTML = topTracks[2];
          document.getElementById("option_4").innerHTML = topTracks[3];
        });
    });
}

function getArtist(response, number) {
  let artist_name = response.items[number].track.artists[0].name;
  return artist_name;
}

function getAlbum(response, number) {
  let albumName = response.items[number].album.name;
  return albumName;
}

function getAlbumTrack(response, albumNum) {
  let randomlength = response.items[albumNum].album.tracks.items.length;
  let albumTrack =
    response.items[albumNum].album.tracks.items[
      getRandomNum(0, randomlength - 1)
    ].name;
  return albumTrack;
}
