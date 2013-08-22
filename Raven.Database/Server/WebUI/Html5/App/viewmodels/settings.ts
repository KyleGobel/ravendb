///<reference path="../durandal/typings/durandal.d.ts"/>
import http = require("durandal/http");
import app = require("durandal/app");

export class settings {

    displayName = "settings";
    activate() { 
        
    }
    canDeactivate() {
        return true;
    } 
}