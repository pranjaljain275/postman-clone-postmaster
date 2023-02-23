import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import axios from "axios"
import prettyBytes from "pretty-bytes"
import setupEditors from "./setupEditor"

const form = document.querySelector("[data-form]")
const queryParamsContainer = document.querySelector("[data-query-params]")
const requestHeadersContainer = document.querySelector("[data-request-headers]")
const keyValueTemplate = document.querySelector("[data-key-value-template]")
const responseHeadersContainer = document.querySelector(
    "[data-response-headers]"
)

// for add button on query-params
document
    .querySelector("[data-add-query-param-btn]")
    .addEventListener("click", () => {
        //appending key value pair
        queryParamsContainer.append(createKeyValuePair())
    })

// for add button on request-header
document
    .querySelector("[data-add-request-header-btn]")
    .addEventListener("click", () => {
        requestHeadersContainer.append(createKeyValuePair())
    })

// Append a new key value pairs
queryParamsContainer.append(createKeyValuePair())
requestHeadersContainer.append(createKeyValuePair())

// interceptor request
axios.interceptors.request.use((request) => {
    // if we already have customData we don't want to overwrite it we use empty object {}
    request.customData = request.customData || {}
    request.customData.startTime = new Date().getTime()
    return request
})

function updateEndTime(response) {
    response.customData = response.customData || {}
    response.customData.time =
        new Date().getTime() - response.config.customData.startTime
    return response
}

// interceptors response
// when success updateEndTime
axios.interceptors.response.use(updateEndTime, (e) => {
    // this func all we do is update the end time so we can figure out how longer request took
    // if failure it will e.response
    return Promise.reject(updateEndTime(e.response))
})

const { requestEditor, updateResponseEditor } = setupEditors()
// add event listener submit on form
form.addEventListener("submit", (e) => {
    e.preventDefault()

    let data
    try {
        // take JSON from document try to convert it to object otherwise null if nothing is there
        data = JSON.parse(requestEditor.state.doc.toString() || null)
    } catch (e) {
        alert("JSON data is malformed")
        return
    }

    // the way axios works you need to pass an object that has a key and a value
    axios({
        url: document.querySelector("[data-url]").value,
        method: document.querySelector("[data-method]").value,
        params: keyValuePairsToObjects(queryParamsContainer),
        headers: keyValuePairsToObjects(requestHeadersContainer),
        data, // this comes from above
    })
        // for catching any error like failed request etc
        .catch((e) => e)
        // Response JavaScript
        .then((response) => {
            document
                .querySelector("[data-response-section]")
                .classList.remove("d-none") //if make response remove d-none class
            updateResponseDetails(response)
            updateResponseEditor(response.data)
            updateResponseHeaders(response.headers)
            console.log(response)
        })
})

// if we make a request you can see it in the details section of Response
function updateResponseDetails(response) {
    document.querySelector("[data-status]").textContent = response.status
    document.querySelector("[data-time]").textContent = response.customData.time
    // Convert bytes to a human readable string: 1337 → 1.34 kB
    document.querySelector("[data-size]").textContent = prettyBytes(
        JSON.stringify(response.data).length +
        JSON.stringify(response.headers).length
    )
}

// if we make a request you can see it in the header section
function updateResponseHeaders(headers) {
    responseHeadersContainer.innerHTML = ""
    // Object.entries allows us to get an array of all our key value pairs
    Object.entries(headers).forEach(([key, value]) => {
        const keyElement = document.createElement("div")
        keyElement.textContent = key
        // append key to responseHeadersContainer
        responseHeadersContainer.append(keyElement)
        const valueElement = document.createElement("div")
        valueElement.textContent = value
        // append value to responseHeadersContainer
        responseHeadersContainer.append(valueElement)
    })
}

function createKeyValuePair() {
    const element = keyValueTemplate.content.cloneNode(true)
    // get the button and add a event listener
    element.querySelector("[data-remove-btn]").addEventListener("click", (e) => {
        e.target.closest("[data-key-value-pair]").remove()
    })
    return element
}

// this function used in axios for changing html to JS
function keyValuePairsToObjects(container) {
    const pairs = container.querySelectorAll("[data-key-value-pair]")
    // convert this pairs to array bydefault they are nodelist
    return [...pairs].reduce((data, pair) => {
        const key = pair.querySelector("[data-key]").value
        const value = pair.querySelector("[data-value]").value

        if (key === "") return data
        // if key is not empty we want to take the data spread it out and add a new key value
        // pair for the data
        return { ...data, [key]: value }
    }, {})
}