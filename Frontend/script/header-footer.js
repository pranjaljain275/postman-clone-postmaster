let header = document.querySelector("header");

// Check if user is logged in
let isLoggedIn = false;

// Check if session exists
if (sessionStorage.getItem('token')) {
  isLoggedIn = true;
}

if (isLoggedIn) {
  // show workspace
  header.innerHTML = `
    <div class="navbar">
      <div>
        <img id="logo" src="image/postmaster logo.jpeg" alt="logo" />
        <a href="index.html"><h2>Home</h2></a>
        <a href="dashboard.html"><h2>Workspace</h2></a>
        <a href="api_network.html"><h2>API Network</h2></a>
        <a href="explore.html"><h2>Explore</h2></a>
      </div>
      <div>
        <input type="text" placeholder="Search Postmaster"/>
      </div>
      <div>
        <p><i class="fa-solid fa-gear"></i></p>
        <p><i class="fa-regular fa-bell" title="Notifications"></i></p>
        <button id="logout-button">Logout</button>
      </div>
    </div>
  `;

  // add event listener to the logout button
  let logoutButton = document.querySelector("#logout-button");
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    window.location.href = "index.html";
  });

} else {
  // hide workspace
  header.innerHTML = `
    <div class="navbar">
      <div>
        <img id="logo" src="image/postmaster logo.jpeg" alt="logo" />
        <a href="index.html"><h2>Home</h2></a>
        <a href="api_network.html"><h2>API Network</h2></a>
        <a href="explore.html"><h2>Explore</h2></a>
      </div>
      <div>
        <input type="text" placeholder="Search Postmaster"/>
      </div>
      <div>
        <p><i class="fa-solid fa-gear"></i></p>
        <p><i class="fa-regular fa-bell"></i></p>
        <button><a href="signup.html">Sign Up</a></button>
      </div>
    </div>
  `;
}

let logo = document.querySelector("#logo");
logo.addEventListener("click", () => {
  window.location.href = "index.html";
});
