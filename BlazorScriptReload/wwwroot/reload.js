/* 
Copyright (c) 2024-2025 by Shaun Walker of Devessence Inc. (https://devessence.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const scriptInfoBySrc = new Map();

function getKey(script) {
    if (script.hasAttribute("src") && script.src !== "") {
        return script.src;
    } else {
        return script.innerHTML;
    }
}

export function onUpdate() {
    let timestamp = Date.now();
    let enhancedNavigation = scriptInfoBySrc.size !== 0;

    // iterate over all script elements in page
    const scripts = document.getElementsByTagName("script");
    for (const script of Array.from(scripts)) {
        let key = getKey(script);
        let scriptInfo = scriptInfoBySrc.get(key);
        if (!scriptInfo) {
            // new script added
            scriptInfo = { timestamp: timestamp };
            scriptInfoBySrc.set(key, scriptInfo);
            if (enhancedNavigation && (!script.hasAttribute("data-reload") || script.getAttribute("data-reload") === "true")) {
                reloadScript(script);
            }
        } else {
            // existing script
            scriptInfo.timestamp = timestamp;
            if (script.hasAttribute("data-reload") && script.getAttribute("data-reload") === "true") {
                reloadScript(script);
            }
        }
    }

    // remove scripts that are no longer referenced
    for (const [key, scriptInfo] of scriptInfoBySrc) {
        if (scriptInfo.timestamp !== timestamp) {
            scriptInfoBySrc.delete(key);
        }
    }
}

function reloadScript(script) {
    try {
        replaceScript(script);
    } catch (error) {
        if (script.hasAttribute("src") && script.src !== "") {
            console.error("Failed to load external script: ${script.src}", error);
        } else {
            console.error("Failed to load inline script: ${script.innerHtml}", error);
        }
    }
}

function replaceScript(script) {
    return new Promise((resolve, reject) => {
        var newScript = document.createElement("script");

        // replicate attributes and content
        for (let i = 0; i < script.attributes.length; i++) {
            newScript.setAttribute(script.attributes[i].name, script.attributes[i].value);
        }
        newScript.innerHTML = script.innerHTML;

        // dynamically injected scripts cannot be async or deferred
        newScript.async = false;
        newScript.defer = false;

        newScript.onload = () => resolve();
        newScript.onerror = (error) => reject(error);

        // remove existing script
        script.remove();

        // replace with new script to force reload in Blazor
        document.head.appendChild(newScript);
    });
}

