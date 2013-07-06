using Raven.Database.Extensions;
using Raven.Database.Server.Abstractions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Raven.Database.Server.Responders
{
    public class Html5Studio : AbstractRequestResponder
    {
        public override string UrlPattern
        {
            get { return @"/html5/(.+)"; }
        }

        public override string[] SupportedVerbs
        {
            get { return new[] { "GET" }; }
        }

        public override void Respond(IHttpContext context)
        {
            var match = urlMatcher.Match(context.GetRequestUrl());
            var fileName = match.Groups[1].Value;
            var paths = GetPaths(fileName);
            var matchingPath = paths.FirstOrDefault(path =>
            {
                try
                {
                    return File.Exists(path);
                }
                catch (Exception)
                {
                    return false;
                }
            });
            if (matchingPath != null)
            {
                context.Response.ContentType = HttpExtensions.GetContentType(matchingPath);
                context.WriteFile(matchingPath);
            }
        }

        public override bool IsUserInterfaceRequest
        {
            get { return true; }
        }

        public static IEnumerable<string> GetPaths(string fileName)
        {
            yield return Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"html5", fileName);
            // dev path
            yield return Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\..\..\Raven.Studio.Html5", fileName);
            // dev path
            yield return Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\Raven.Studio.Html5", fileName);
            //local path
            yield return Path.Combine(AppDomain.CurrentDomain.BaseDirectory, fileName);
            //local path, bin folder
            //yield return Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bin", fileName);
        }
    }
}
