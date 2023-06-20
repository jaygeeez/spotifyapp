const client_id = "b0967dcab86e44698289a22765cf49dc";
const client_secret = "14aa4e5fce0443a4a4bca54c5ba51ba2";
const payload = client_id + ":" + client_secret;
//const encodedPayload = Buffer.from(payload).toString("base64");
const encodedPayload = utf8_to_b64(payload);
var access_token = "";
var tracks = "";

// fetching the Spotify API
fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    "Content-type": "application/x-www-form-urlencoded",
    Authorization: "Basic " + encodedPayload,
  },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    //     'client_id': 'b0967dcab86e44698289a22765cf49dc',
    //     'client_secret':'14aa4e5fce0443a4a4bca54c5ba51ba2'
  }),
  json: true,
})
  .then((response) => response.json())
  .then((response) => 
  {
    console.log(JSON.stringify(response))
    access_token = response.access_token;
    //console.log(access_token);

    // trying to get tracks
    fetch('https://api.spotify.com/v1/tracks/02nhDSWvcXYALyVkth2oXd?market=CA', {
      method: "GET",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    })
      .then((response) => response.json())
      .then((response) =>
      {
        console.log(JSON.stringify(response.album.total_tracks))
        //tracks = response.tracks; 
      });

  });

// functions to change strings to base64 and vice versa
function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

// if you want to see access_token outside of the fetch
//setTimeout(() => console.log(access_token), 1000);