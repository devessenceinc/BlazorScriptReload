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
    // listen for enhanced navigation
    blazor.addEventListener('enhancedload', onEnhancedLoad);
}

function onEnhancedLoad() {
    if (scriptReloadEnabled) {
        reloadScripts();
    }
}

function reloadScripts() {
    // determine if this is an enhanced navigation
    let enhancedNavigation = scriptKeys.size !== 0;

    // iterate over all script elements in document
    const scripts = document.getElementsByTagName('script');
    for (const script of Array.from(scripts)) {
        // only process scripts that include a data-reload attribute
        if (script.hasAttribute('data-reload')) {
            let key = getKey(script);

            if (enhancedNavigation) {
                // reload the script if data-reload is true or if data-reload is false and the script has not been loaded previously
                let dataReload = script.getAttribute('data-reload');
                if (dataReload === 'true' || (dataReload == 'false' && !scriptKeys.has(key))) {
                    reloadScript(script);
                }
            }

            // save the script key
            if (!scriptKeys.has(key)) {
                scriptKeys.add(key);
            }
        }
    }
}

function getKey(script) {
    // the key is either the script src for external scripts or the script content for inline scripts
    if (script.src) {
        return script.src;
    } else {
        return script.innerHTML;
    }
}

function reloadScript(script) {
    try {
        if (isValid(script)) {
            replaceScript(script);
        }
    } catch (error) {
        if (script.src) {
            console.error(`Blazor Script Reload failed to load external script: ${script.src}`, error);
        } else {
            console.error(`Blazor Script Reload failed to load inline script: ${script.innerHTML}`, error);
        }
    }
}

function isValid(script) {
    if (script.innerHTML.includes('document.write(')) {
        console.log(`Script using document.write() not supported by Blazor Script Reload: ${script.innerHTML}`);
        return false;
    }
    return true;
}
function replaceScript(script) {
    return new Promise((resolve, reject) => {
        var newScript = document.createElement('script');

        // replicate attributes and content
        for (let i = 0; i < script.attributes.length; i++) {
            newScript.setAttribute(script.attributes[i].name, script.attributes[i].value);
        }
        newScript.innerHTML = script.innerHTML;
        newScript.removeAttribute('data-reload');

        // dynamically injected scripts cannot be async or deferred
        newScript.async = false;
        newScript.defer = false;

        newScript.onload = () => resolve();
        newScript.onerror = (error) => reject(error);

        // remove existing script element
        script.remove();

        // replace with new script element to force reload in Blazor
        document.head.appendChild(newScript);
    });
}

