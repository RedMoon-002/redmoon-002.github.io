using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;

internal static class SentinelLauncher
{
    private const string Address = "http://localhost:8080/";
    private static readonly string Root = AppDomain.CurrentDomain.BaseDirectory;

    [STAThread]
    private static void Main()
    {
        if (!File.Exists(Path.Combine(Root, "index.html")))
        {
            Console.Error.WriteLine("Sentinel files were not found next to this launcher.");
            Console.ReadKey();
            return;
        }

        var listener = new HttpListener();
        listener.Prefixes.Add(Address);
        try { listener.Start(); }
        catch (HttpListenerException)
        {
            Console.Error.WriteLine("Port 8080 is already in use. Close the other Sentinel server, then try again.");
            Console.ReadKey();
            return;
        }

        Process.Start(Address);
        Console.WriteLine("Sentinel is running at " + Address);
        Console.WriteLine("Keep this window open while monitoring. Press Ctrl+C to stop.");

        while (listener.IsListening)
        {
            try
            {
                var context = listener.GetContext();
                ThreadPool.QueueUserWorkItem(delegate { Serve(context); });
            }
            catch (HttpListenerException) { break; }
        }
    }

    private static void Serve(HttpListenerContext context)
    {
        try
        {
            var requested = context.Request.Url.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            if (String.IsNullOrEmpty(requested)) requested = "index.html";
            var file = Path.GetFullPath(Path.Combine(Root, requested));
            if (!file.StartsWith(Root, StringComparison.OrdinalIgnoreCase) || !File.Exists(file))
            {
                context.Response.StatusCode = 404;
                context.Response.Close();
                return;
            }

            context.Response.ContentType = ContentType(Path.GetExtension(file));
            var bytes = File.ReadAllBytes(file);
            context.Response.ContentLength64 = bytes.Length;
            context.Response.OutputStream.Write(bytes, 0, bytes.Length);
            context.Response.Close();
        }
        catch { try { context.Response.Abort(); } catch { } }
    }

    private static string ContentType(string extension)
    {
        switch (extension.ToLowerInvariant())
        {
            case ".html": return "text/html; charset=utf-8";
            case ".js": return "text/javascript; charset=utf-8";
            case ".css": return "text/css; charset=utf-8";
            case ".png": return "image/png";
            case ".jpg": case ".jpeg": return "image/jpeg";
            default: return "application/octet-stream";
        }
    }
}
