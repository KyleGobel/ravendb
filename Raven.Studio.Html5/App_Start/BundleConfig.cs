using System.Web;
using System.Web.Optimization;

namespace Raven.Studio.Web
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/3rdPartyLibs")
                .Include("~/Scripts/3rdPartyLibs/jquery-{version}.js")
                .Include("~/Scripts/3rdPartyLibs/modernizr-*")
                .Include("~/Scripts/3rdPartyLibs/bootstrap*")
                .Include("~/Scripts/3rdPartyLibs/knockout-{version}.js")
                .Include("~/Scripts/3rdPartyLibs/knockout-delegatedEvents.js"));

            bundles.Add(new StyleBundle("~/Content/styles")
                .Include("~/Content/css/bootstrap.css", "~/Content/css/bootstrap-responsive.css")
                .Include("~/Content/css/font-awesome.css")
                .Include("~/Content/css/raven.studio.css"));
        }
    }
}