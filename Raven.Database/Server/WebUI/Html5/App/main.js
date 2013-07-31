requirejs.config({
    paths: {
        'text': 'durandal/amd/text'
    }
});

define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'durandal/plugins/router'],
    function(app, viewLocator, system, router) {

        //>>excludeStart("build", true);
        system.debug(true);
        //>>excludeEnd("build");

        app.title = 'Raven Studio';
        app.start().then(function() {
            viewLocator.useConvention();
            router.useConvention();

            router.map([
				{ url: 'documents', moduleId: 'viewmodels/documents', name: 'Documents', visible: true },
				{ url: 'indexes', moduleId: 'viewmodels/indexes', name: 'Indexes', visible: true },
				{ url: 'query', moduleId: 'viewmodels/query', name: 'Query', visible: true },
				{ url: 'tasks', moduleId: 'viewmodels/tasks', name: 'Tasks', visible: true },
				{ url: 'settings', moduleId: 'viewmodels/settings', name: 'Settings', visible: true },
				{ url: 'status', moduleId: 'viewmodels/status', name: 'Status', visible: true },
				{ url: 'edit', moduleId: 'viewmodels/editDocument', name: 'Edit Document', visible: false },
            ]);
			
            app.adaptToDevice();
            app.setRoot('viewmodels/shell', 'entrance');
        });
    });