using fetch_desk.Endpoints;
using fetch_desk.Endpoints.Resources;
using fetch_desk.Hubs;
using fetch_desk.Infra;
using fetch_desk.Workers;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace fetch_desk
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString));

            builder.Services.AddMassTransit(x =>
            {
                // Registra o consumidor (worker) que lerá a fila
                x.AddConsumer<OrderPlacedConsumer>();

                x
                .UsingRabbitMq((context, cfg) =>
                {
                    cfg.Host("localhost", "/", h => {
                        h.Username("guest");
                        h.Password("guest");
                    });

                    // Configura a fila que receberá os pedidos
                    cfg.ReceiveEndpoint("delivery-queue", e =>
                    {
                        e.ConfigureConsumer<OrderPlacedConsumer>(context);
                    });
                });
            });

            builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>());

            // Add services to the container.
            builder.Services.AddAuthorization();

            builder.Services.AddSignalR();

            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder.WithOrigins("https://localhost:5005", "http://localhost:5005", "https://localhost:7259", "https://localhost:7173", "http://localhost:5138")
                           .AllowAnyHeader()
                           .AllowAnyMethod()
                           .AllowCredentials();
                });
            });

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            //app.UseCors("AllowBlazorClient");
            app.UseCors();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.MapOpenApi();
            }

            app.MapHub<OrderHub>("/orderhub");

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapEndpoints();

            app.Run();
        }
    }
}
