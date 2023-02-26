document.querySelector(".btn").addEventListener("click", register);
document.querySelector(".gbtn").addEventListener("click", auth);

async function auth(event) {
  event.preventDefault();

  window.location = "https://good-lime-meerkat-suit.cyclic.app/auth/google";

  // let res=await fetch("http://localhost:7575/auth/google")
}

async function register(event) {
  event.preventDefault();
  try {
    let email = document.querySelector("#email").value;
    let username = document.querySelector("#username").value;
    let password = document.querySelector("#password").value;

    if (email == "" || username == "" || password == "") {
      alert("Fill the details correctly");
      return;
    }

    let regdata = {
      username,
      email,
      password,
    };
    let regurl = "https://good-lime-meerkat-suit.cyclic.app/user/signup";

    let res = await fetch(regurl, {
      method: "POST",
      body: JSON.stringify(regdata),
      headers: {
        "Content-type": "application/json",
      },
    });
    let data = await res.json();
    alert(data.msg);

    console.log(data);

    window.location = "signin.html";
  } catch (err) {
    console.log(err);
  }
}
