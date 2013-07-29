Raven.Studio.Html5 project layout and developer info:

This is an HTML5 port of the old Silverlight version of Raven Studio as of Raven 2.5.

Raven.Studio.Html5
	- Is a single page application (SPA) with no server-side component, communicating only with a Raven server.
	- Is intended to be served from a Raven server. Upon compiling this project, the app files will be copied and embeedded into Raven.Database project, under the /Server/WebUI/Html5 directory.
	- Is written in TypeScript (http://typescriptlang.org), a superset of JavaScript that adds classes, modules, a flexible type system, compilation, and features from next version of JavaScript (ES6).
	- Uses LESS (http://lesscss.org/), a CSS superset that adds variables, mixins, functions, and more.
	- Uses the DruandalJS (http://durandaljs.com) single page application framework for a clean MVVM architecture, UI modules, navigation, and more. DurandalJS itself is built upon some well-known technologies:
		- KnockoutJS (http://knockoutjs.com) for MVVM architecture and data binding
		- Twitter Bootstrap (http://twitter.github.io/bootstrap/) for a consistent UI look & feel
		- RequireJS (http://requirejs.org/) for asynchronous module loading (UIs and view models get loaded asynchronously, on-demand)	


We use Durandal.js (http://durandaljs.com), the single page application framework from Rob Eisenberg. The project layout follows the Durandal standard:
	
	- App: application code
		- common: app code shared across multiple views
		- durandal: durandal framework code. Also contains /widgets, which is where Durandal looks for your app's UI widgets (e.g. our dataTable widget, used in the documents view)
		- models: objects we get back from Raven, e.g. collection, document, etc.
		- viewmodels: a class for every view. The class contains data and logic for a view. For example, documents.ts is the view model for the documents page in the app.
		- views: HTML page for every navigable location in the app. For example, documents.html is the 
	- Content: images
	- Scripts: 3rd party scripts (jquery, etc) and TypeScript type definitions for 3rd party libraries
	- Index.html - this is the single page hosting the whole application


To build in Visual Studio 2012:
	- Install the TypeScript tools (http://go.microsoft.com/fwlink/?LinkID=266563)
	- Install the Web Essentials plugin (http://visualstudiogallery.msdn.microsoft.com/07d54d12-7133-4e15-becb-6f451ea3bea6) for LESS compilation, TypeScript compile-on-save, and more.
	- Configure TypeScript compilation to use AMD modules and .map debugging files:
		- Tools->Options-Web Essentials->TypeScript
			- Use the AMD module = true. This is required to generate proper async module support when compiling TypeScript. This is necessary because DurandalJS uses RequireJS async module loading.
			- [Optional] Generate source map = true. This is used to debug TypeScript in Google Chrome.


To run:
	- Build and run Raven.Server. Then open a web browser to http://localhost:8080/html5
	- [optional] For easier debugging, instead of rebuilding and running a whole new Raven server every time, you can just leave a Raven Server running and while editing and debugging just the HTML5 Studio. To make this work, add this line XML snippet <add key="Raven/AccessControlAllowOrigin" value="*" /> to the Raven.Server.exe.config file, run Raven server. Go to /App/common/raven.ts and uncomment the baseUrl line. Launch Raven.Studio.Html5 project from Visual Studio (or just run /RavenStudio.Html5/index.html) and will work with your already-running Raven server.


To debug, you'll want to be debugging the TypeScript code. 
	- To debug the TypeScript inside Visual Studio, set a breakpoint as usual and start debugging in Internet Explorer.
	- To debug TypeScript in the browser, run the app in Google Chrome. Provided you set "Generate source map = true" (see build instructions above), you'll be able to debug the TypeScript inside Google Chrome, just like you would with normal JavaScript. This will work with any browser that supports source maps (at the time of this writing, only Google Chrome.)