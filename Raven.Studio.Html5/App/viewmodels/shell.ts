///<reference path="../durandal/typings/durandal.d.ts"/>
export import router = module("durandal/plugins/router");
import app = module("durandal/app");

export class shell {

    router = router;
    search() {
        app.showMessage('Search not yet implemented...');
    }

    activate() {
        return router.activate('documents');
    }
}

new shell();