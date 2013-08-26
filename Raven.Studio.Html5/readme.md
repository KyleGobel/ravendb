# Introduction

Raven.Studio.Html5 is a rewrite of the old Silverlight version of Raven.Studio.

Raven.Studio.Html5 is a single page application (SPA) with no server-side component, communicating only with a Raven server. It uses Durandal.js to partition the app into logical modules. Duruandal uses <a href="http://getbootstrap.com">Twitter Bootstrap</a> for a consistent UI, <a href="http://knockoutjs.com">KnockoutJS</a> for data-binding, and <a href="http://requirejs.org">RequireJS</a> for loading views and view models on demand.

The application code is written in <a href="http://typescriptlang.org">TypeScript</a>.

## Code layout
-	Index.html - this is the single page hosting the whole application, pulling in the 3rd party libs and CSS.
-	/App: application code
-	/App/common: app code shared across multiple views
- /App/models: classes that model the data we get back from Raven, e.g. collection, document, etc.
-	/App/viewmodels: a class for every view. The class contains data and logic for a view. For example, documents.ts is the viewmodel for the documents page.
-	/App/views: HTML page for every location in the app. For example, documents.html is the view for the documents page.
-	/Content: images, fonts, CSS/LESS. Of special note is App.less, which contains the styles specific to the app.
-	/Scripts: 3rd party scripts (jquery, Knockout, etc.)
-	/Scripts/typings: TypeScript type definitions for 3rd party libraries.

## To build in Visual Studio 2012:
-	Install the TypeScript tools (http://go.microsoft.com/fwlink/?LinkID=266563). The TypeScript compiler will compile TS files on save.
-	Install the Web Essentials plugin (http://visualstudiogallery.msdn.microsoft.com/07d54d12-7133-4e15-becb-6f451ea3bea6) for LESS compilation.

## Running the app
<b>For development</b>, run a Raven 2.5 server, then run index.html. This requires 2 prereqs:
- The Raven.Server.exe.config must have <add key="Raven/AccessControlAllowOrigin" value="*" />
- If the server is running somewhere besides http://localhost:8080, you'll need to change /App/common/Raven.ts baseUrl variable accordingly.
<b>For production</b>, Raven.Studio.HTML5 is embedded into the server itself. To run it:
- Change /App/common/Raven.ts <b>baseUrl</b> field to an empty string.
- Build and run the Raven Server, then point your browser to http://[serverurl]/html5/index.html


## Debugging
To debug the TypeScript inside Visual Studio, set a breakpoint as usual and start debugging in Internet Explorer.

To debug TypeScript in the browser, run the app in Google Chrome. Thanks to <a href="http://www.aaron-powell.com/posts/2012-10-03-typescript-source-maps.html">source maps</a>, you'll be able to debug the TypeScript inside Google Chrome, just like you would with normal JavaScript. This will work with any browser that supports source maps.
