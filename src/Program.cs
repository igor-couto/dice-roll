using System.Security.Cryptography;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseKestrel(option => option.AddServerHeader = false);

var app = builder.Build();

var physicalFileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "frontend"));

app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = physicalFileProvider });
app.UseStaticFiles(new StaticFileOptions { FileProvider = physicalFileProvider });

app.MapGet("/roll", () => Results.Ok(RandomNumberGenerator.GetInt32(1, 7)));

app.Run();