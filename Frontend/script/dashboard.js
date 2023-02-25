async function runFunction() {
  let url = document.querySelector(".form-control").value;
  let method = document.querySelector(".form-select").value;
  let data = document.querySelector(".body").value;
  if (method == "GET") {
    try {
      let startTime = performance.now();
      let response = await fetch(url, {
        method: method,
        headers: { "Content-type": "application/json" },
        // body: JSON.stringify(data)
      });
      let endTime = performance.now();
      let dataSize = new Blob([await response.clone().text()]).size;
      if (response.ok) {
        let data = await response.json();
        data = JSON.stringify(data, null, 2); // using indentation of 2 spaces
        showdata(response, data, endTime - startTime, dataSize);
      } else {
        console.log(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw error;
    }
  } else if (method == "POST") {
    try {
      let startTime = performance.now();
      let response = await fetch(url, {
        method: method,
        headers: { "Content-type": "application/json" },
        body: data,
      });
      let endTime = performance.now();
      let dataSize = new Blob([await response.clone().text()]).size;
      if (response.ok) {
        let data = await response.json();
        data = JSON.stringify(data, null, 2); // using indentation of 2 spaces
        showdata(response, data, endTime - startTime, dataSize);
      } else {
        console.log(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw error;
    }
  } else if (method == "PUT" || method == "PATCH" || method == "DELETE") {
    try {
      let startTime = performance.now();
      let response = await fetch(url, {
        method: method,
        headers: { "Content-type": "application/json" },
        body: data,
      });
      let endTime = performance.now();
      let dataSize = new Blob([await response.clone().text()]).size;
      if (response.ok) {
        if (method == "DELETE") {
          // Make another GET request to get the updated data
          showdata(
            response,
            "Successfully deleted the resource.",
            endTime - startTime,
            dataSize
          );
          let getResponse = await fetch(url, {
            method: "GET",
            headers: { "Content-type": "application/json" },
          });
          if (getResponse.ok) {
            let data = await getResponse.json();
            data = JSON.stringify(data, null, 2); // using indentation of 2 spaces
            showdata(getResponse, data, endTime - startTime, dataSize);
          } else {
            console.log(
              `Error: ${getResponse.status} ${getResponse.statusText}`
            );
          }
        } else {
          showdata(
            response,
            "Successfully updated the resource.",
            endTime - startTime,
            dataSize
          );
        }
      } else {
        console.log(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw error;
    }
  }
}

function showdata(response, data, responseTime, dataSize) {
  let space = document.querySelector("[data-response-headers]");
  let me3 = document.querySelector("[data-status]");
  me3.innerHTML = `${response.status} ${response.statusText}`;

  let me2 = document.querySelector("[data-time]");
  me2.innerHTML = `${responseTime.toFixed(2)}`;

  let me1 = document.querySelector("[data-size]");
  me1.innerHTML = `${dataSize} bytes`;

  space.innerHTML = "";
  space.innerHTML = `
      <pre>${data}</pre>
    `; // using pre tag to preserve formatting
}
