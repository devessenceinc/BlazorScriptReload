# Blazor Script Reload

This project demonstrates a simple approach for using standard ```<script>``` elements in Blazor Web Applications (ie. Static Blazor using Enhanced Navigation). It was inspired by the BlazorPageScript project created by Mackinnon Buck (https://github.com/MackinnonBuck/blazor-page-script) however it takes a different approach.

## Goals

- allow developers to use standard ```<script>``` elements in their Blazor Web Application components
- allow content creators to use standard ```<script>``` elements in their markup (if they have the permission to do so in their application)
- leverage standard browser script loading behaviors
- support external and in-line scripts
- support scripts in the head and body of a document
- support most standard script libraries without requiring any modification
- support script loading order to manage script dependencies
- provide a simple alternative for simulating onload behavior during enhanced navigation
- utilize an opt-in approach to avoid undesired side effects
- provide a simple integration story

## Solution

Utilizes a custom HTML element which interacts with the Blazor "enhancedload" event. When an "enhancedload" occurs it trigger logic which iterates over all of the script elements in the page. Any script element which has a data-reload attribute specified is "replaced" in the DOM which forces the browser to process the script element utilizing its standard script loading approach.

## Integration

- include the BlazorScriptReload Nuget package into your project
- add a @using BlazorScriptReload to your _Imports.razor
- include a single reference to the ```<ScriptReload />``` component at the bottom of your body section in App.razor 

## Basic Usage

Standard ```<script>``` elements can be used in Blazor components or content (including support for all standard attributes such as "type", "integrity", "crossorigin", etc...). However in order for a ```<script>``` element to be reloaded it MUST include a custom "data-reload" attribute:

data-reload="true" - indicates that the script element should always be reloaded during an enhanced navigation. This ensures that any new scripts which are encountered are always loaded. It is also useful if you have scripts which are expected to be executed on every enhanced navigation (ie. in-line scripts).

data-reload="false" - indicates that the script element should only be reloaded during an enhanced navigation if it was not already reloaded previously. This is useful for JavaScript libraries which only need to be loaded once and are then utilized by other JavaScript logic in your application.

## Example

_Example.razor_
```
@page "/example"

<PageTitle>Example</PageTitle>

<script data-reload="true">console.log("Inline Script");</script>
<script src="Example.js" data-reload="true"></script>

```
_Example.js_

```
console.log('External Script');
```

Take a look at the `samples` folder in this repository for more usage examples.

## BasicSample

The BasicSample project in the `samples` folder can be used for reference. Make sure you set BasicSample as the Startup Project for your solution before you run the project. The BasicSample has a number of different scenarios and it allows you to toggle the Blazor Script Reload option at run-time to view the differences in behavior.

![image](https://github.com/user-attachments/assets/65ecc9d0-3d82-4c7d-95d3-42130580b9f0)

## Notes

This solution does not actually "load" JavaScript - it simply replaces the ```script``` element in the DOM and relies on the browser to load the script using its standard behavior (ie. taking into consideration caching, etc...)

This solution does NOT support Interactive Blazor. Interactive Blazor uses a completely different approach for managing JavaScript integration (ie. JSInterop).

This solution was originally created for Oqtane (https://www.oqtane.org) - a CMS and Application Framework for Blazor and .NET MAUI. Oqtane is a modern development platform which solves many challenging problems for developers (ie. multi-tenancy, modularity, etc...) allowing them to focus on building applications rather than infrastructure.
