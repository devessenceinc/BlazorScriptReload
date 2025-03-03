# Blazor Script Reload

![BlazorScriptReload - a solution for using JavaScript in Blazor Web Applications](https://github.com/devessenceinc/BlazorScriptReload/blob/main/BlazorScriptReload.png?raw=true)

Blazor Web Applications (ie. Static Server-Side Blazor using Enhanced Navigation) only process ```<script>``` elements during the initial page load. This means that any ```<script>``` elements which are encountered during subsequent "enhanced" navigations are ignored, resulting in unexpected behavior and broken functionality. 

This project provides a simple solution for allowing ```<script>``` elements to behave in a standard manner in a Blazor Web Application. It was inspired by the [BlazorPageScript](https://github.com/MackinnonBuck/blazor-page-script) project created by Mackinnon Buck however it takes a different approach.

## Goals

- allow developers to use standard ```<script>``` elements in their Blazor Web Application components
- allow content creators to use standard ```<script>``` elements in their markup (if they have the permission to do so in their application)
- leverage standard browser script loading behaviors
- support external and in-line scripts
- support scripts in the head and body of a document
- support most standard script libraries without requiring any modification
- support script loading order to manage script dependencies
- provide a simple alternative for simulating onload behavior during enhanced navigation
- ensure that scripts are only executed once per enhanced navigation** (see Notes)
- utilize an opt-in approach to avoid undesired side effects
- provide a simple integration story

## Solution

Utilizes a custom HTML element which interacts with the Blazor "enhancedload" event. When an "enhancedload" occurs it triggers logic which iterates over all of the script elements in the page. Any script element which has a **data-reload** attribute specified is "replaced" in the DOM which forces the browser to process the script element utilizing its standard script loading approach.

## Integration

- include the latest BlazorScriptReload Nuget package into your Blazor Web Application project:

```
<ItemGroup>
    <PackageReference Include="BlazorScriptReload" Version="1.0.5" />
</ItemGroup>
```

- add a ```@using BlazorScriptReload``` to your _Imports.razor (or simply add the using statement to App.razor as that is the only place it will be referenced)

- include the ```<ScriptReload />``` component at the bottom of your body section in App.razor:

```
<body>
    <Routes />
    ...
    <script src="_framework/blazor.web.js"></script>
    <ScriptReload />
</body>
```

## Basic Usage

Standard ```<script>``` elements can be used in Blazor components or page content (including support for all standard attributes such as "type", "integrity", "crossorigin", etc...). However in order for a ```<script>``` element to be reloaded it MUST include a custom "**data-reload**" attribute:

**data-reload="once"** - indicates that the script element should be loaded during an enhanced navigation if it was not already loaded previously. This is useful for JavaScript libraries which only need to be loaded once and are then utilized by other JavaScript logic in your application.

**data-reload="always" (or "true")** - indicates that the script element should always be reloaded during an enhanced navigation. This is useful if you have scripts which are expected to be executed on every enhanced navigation (ie. in-line scripts).

## Examples

The example below is a standard Blazor page component which contains two ```<script>``` elements (in-line and external) which log a message to the browser console. In a standard Blazor Web Application these ```<script>``` elements would be ignored if the "example" page was requested after an "enhanced navigation" (ie. if a user initially loaded the "home" page and then navigated to the "example" page). Blazor Script Reload will ensure that these scripts are always executed as expected. You can test the difference in behavior by modifying the data-reload attribute value on the ```<script>``` elements and observing the results.

_Example1.razor_
```
@page "/example1"

<script data-reload="always">console.log('Inline Script');</script>
<script src="Example1.js" data-reload="always"></script>

```
_Example1.js_

```
console.log('External Script');
```

The example below is a standard Blazor page component which contains three ```<script>``` elements. The first two elements are external JavaScript libraries (requiring integrity and crossorigin attributes for security) which only need to be loaded once. The third element is a local script which displays a gallery of images and needs to be executed on every enhanced navigation to the page. Note that the third script is dependent upon the capabilities of the first two scripts and therefore needs to be loaded last. 

```
@page "/example2"

<script src="https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js" data-reload="once" integrity="sha384-GNFwBvfVxBkLMJpYMOABq3c+d3KnQxudP/mGPkzpZSTYykLBNsZEnG2D9G/X/+7D" crossorigin="anonymous"></script>
<script src="https://unpkg.com/imagesloaded@5.0.0/imagesloaded.pkgd.min.js" data-reload="once" integrity="sha384-e3sbGkYzJZpi7OdZc2eUoj7saI8K/Qbn+kPTdWyUQloiKIc9HRH4RUWFVxTonzTg" crossorigin="anonymous"></script>
<script src="gallery.js" data-reload="always"></script>
```

Take a look at the `samples` folder in this repository for more advanced usage examples.

## BasicSample

The BasicSample project in the `samples` folder can be used for reference. Make sure you set BasicSample as the Startup Project for your solution before you run the project. The BasicSample has a number of different scenarios and it allows you to toggle the Blazor Script Reload option at run-time to view the differences in behavior.

![image](https://github.com/user-attachments/assets/65ecc9d0-3d82-4c7d-95d3-42130580b9f0)

## Notes

This solution does not actually "load" JavaScript - it simply replaces the ```<script>``` element in the DOM and relies on the browser to load the script using its standard behavior (ie. taking into consideration caching, etc...).

External scripts are identified using their "src" attribute. In-line scripts are identified by their "id" attribute, or if it is not specified, by their content. 

This solution DOES support Stream Rendering however due to the fact that Stream Rendering refreshes the UI multiple times as content is streamed to the browser, your script may be executed multiple times. ** Note that in .NET 9 there is a new event 'enhancednavigationend' which is triggered after all stream rendering has completed and would be a better option for ensuring script reloads only occur once per enhanced navigation. This event is not utilized currently as BlazorScriptReload needs to support applications using .NET 8 (LTS).

This solution DOES support Interactive components within Static Blazor Web Applications. The BasicSample project includes an Interactive page to demonstrate that BlazorScriptReload supports interactive components.

This solution does NOT support Globally Interactive Blazor Applications. Globally Interactive Blazor Applications use a completely different approach for managing JavaScript integration (ie. JS Interop). 

This solution does NOT support _document.write_. This is because BlazorScriptReload executes after the page has been rendered, which means _document.write_ will overwrite the entire document's content. Note that standard Blazor Web Applications also do not support _document.write_ as it is ignored on enhanced navigations. So the recommended solution is to replace _document.write_ logic with alternatives which target specific DOM elements (see the BasicSample application for reference). 

This solution is NOT intended to solve every challenge related to JavaScript and Blazor Web Applications. There are scenarios where this solution is not appropriate and developers will need to explore alternative solutions such as [Blazor Page Script](https://github.com/MackinnonBuck/blazor-page-script) or [BlazorJsComponents](https://github.com/MackinnonBuck/blazor-js-components).

This solution was originally created for [Oqtane](https://www.oqtane.org) - a CMS and Application Framework for Blazor and .NET MAUI. Oqtane is a modern development platform which solves many challenging problems for developers (ie. multi-tenancy, modularity, etc...) allowing them to focus on building applications rather than infrastructure.
