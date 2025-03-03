/* 
Blazor Script Reload
Copyright (c) 2024-2025 
by Shaun Walker of Devessence Inc. (https://devessence.com)

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

let scriptReloadEnabled = false;
const scriptKeys = new Set();

export function afterWebStarted(blazor) {
    // define custom element
    customElements.define('script-reload', class extends HTMLElement {
        connectedCallback() {
            scriptReloadEnabled = true;
        }    
        disconnectedCallback() {
            scriptReloadEnabled = false;
        }    
    });
    // listen for enhanced navigation (note that 'enhancednavigationend' is a new event in .NET 9 which is a better option)
    blazor.addEventListener('enhancedload', onEnhancedLoad);
}

function onEnhancedLoad() {
    if (scriptReloadEnabled) {
        reloadScripts();
    }
}

function reloadScripts() {
    // iterate over all script elements in document
    const scripts = document.getElementsByTagName('script');
    for (const script of Array.from(scripts)) {
        // only process scripts that include a data-reload attribute
        if (script.hasAttribute('data-reload')) {
            let key = getKey(script);

            // reload the script if data-reload is "always" or "true"... or if the script has not been loaded previously and data-reload is "once"
            let dataReload = script.getAttribute('data-reload');
            if ((dataReload === 'always' || dataReload === 'true') || (!scriptKeys.has(key) && dataReload == 'once')) {
                reloadScript(script);
            }

            // save the script key
            if (!scriptKeys.has(key)) {
                scriptKeys.add(key);
            }
        }
    }
}

function getKey(script) {
    if (script.src) {
        return script.src;
    } else if (script.id) {
        return script.id;
    } else {
        return script.innerHTML;
    }
}

function reloadScript(script) {
    try {
        if (isValid(script)) {
            injectScript(script);
        }
    } catch (error) {
        console.error(`Blazor Script Reload failed to load script: ${getKey(script)}`, error);
    }
}

function isValid(script) {
    if (script.innerHTML.includes('document.write(')) {
        console.log(`Blazor Script Reload does not support scripts using document.write(): ${script.innerHTML}`);
        return false;
    }
    return true;
}

function injectScript(script) {
    return new Promise((resolve, reject) => {
        var newScript = document.createElement('script');

        // replicate attributes and content
        for (let i = 0; i < script.attributes.length; i++) {
            if (script.attributes[i].name !== 'data-reload') {
                newScript.setAttribute(script.attributes[i].name, script.attributes[i].value);
            }
        }
        newScript.nonce = script.nonce; // must be referenced explicitly
        newScript.innerHTML = script.innerHTML;

        // dynamically injected scripts cannot be async or deferred
        newScript.async = false;
        newScript.defer = false;

        newScript.onload = () => resolve();
        newScript.onerror = (error) => reject(error);

        // inject script element in head to force execution in Blazor
        document.head.appendChild(newScript);

        // remove data-reload attribute
        script.removeAttribute('data-reload');
    });
}

