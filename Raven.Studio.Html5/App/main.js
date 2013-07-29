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
            //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
            //Look for partial views in a 'views' folder in the root.
            viewLocator.useConvention();
            router.useConvention();

            // Visible routes            
            router.mapNav('documents');
            router.mapNav('indexes');
            router.mapNav('query');
            router.mapNav('tasks');
            router.mapNav('settings');
            router.mapNav('status');

            // Non-visible routes.
            router.mapRoute('editDocument', null, null, false); // Edit a document. Expects route like /edit?id=Orders/123

            app.adaptToDevice();

            //Show the app by setting the root view model for our application with a transition.
            app.setRoot('viewmodels/shell', 'entrance');
        });
    });