document.querySelector(".btn").addEventListener("click", login);

async function login(event) {
  event.preventDefault();
  try {
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;

    if (email == "" || password == "") {
      alert("Fill the details correctly");
      return;
    }

    let logdata = {
      email,
      password,
    };

    let logurl = "https://good-lime-meerkat-suit.cyclic.app/user/login";

    let res = await fetch(logurl, {
      method: "POST",
      body: JSON.stringify(logdata),
      headers: {
        "Content-type": "application/json",
      },
    });
    let data = await res.json();
    if (data.token) {
      // Store the access token in the session storage
      sessionStorage.setItem('token', data.token);
      alert("login Success");
      window.location = "index.html";
    } else {
      alert("Login failed. Please try again.");
    }
    window.location = "index.html";
  } catch (err) {
    console.log("err", err);
  }
}
