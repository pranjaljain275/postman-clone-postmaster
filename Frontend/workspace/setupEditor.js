// JSON Text Editors

import { EditorState, basicSetup } from "@codemirror/basic-setup"
import { defaultTabBinding } from "@codemirror/commands"
import { EditorView, keymap } from "@codemirror/view"
import { json } from "@codemirror/lang-json"

// get our actual elements
export default function setupEditors() {
    const jsonRequestBody = document.querySelector("[data-json-request-body]")
    const jsonResponseBody = document.querySelector("[data-json-response-body]")

    const basicExtensions = [
        basicSetup,
        keymap.of([defaultTabBinding]), //allow us tab inside text editor
        json(),
        EditorState.tabSize.of(2),
    ]

    const requestEditor = new EditorView({
        state: EditorState.create({
            doc: "{\n\t\n}", // doc is like text content
            extensions: basicExtensions,
        }),
        parent: jsonRequestBody,
    })

    const responseEditor = new EditorView({
        state: EditorState.create({
            doc: "{}", //empty JS object
            extensions: [...basicExtensions, EditorView.editable.of(false)],
        }),
        parent: jsonResponseBody,
    })

    // update the contents inside the Response Editor
    function updateResponseEditor(value) {
        responseEditor.dispatch({
            changes: {
                from: 0,
                to: responseEditor.state.doc.length,
                insert: JSON.stringify(value, null, 2),
            },
        })
    }

    return { requestEditor, updateResponseEditor }
}