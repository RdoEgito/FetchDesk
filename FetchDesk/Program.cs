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

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                ?? builder.Configuration["ConnectionStrings:DefaultConnection"]
                ?? builder.Configuration["DATABASE_URL"];

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new Exception("Connection string 'DefaultConnection' not found.");
            }

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString));

            builder.Services.AddMassTransit(x =>
            {
                //x.SetKeyNameService(new MassTransit.Configuration.ConstantKeyNameService("community"));

                x.AddConsumer<OrderPlacedConsumer>();

                x.UsingRabbitMq((context, cfg) =>
                {
                    // Pega a URL do CloudAMQP das variáveis de ambiente
                    var rabbitUrl = builder.Configuration.GetValue<string>("RABBITMQ_URL")
                        ?? "rabbitmq://localhost";

                    cfg.Host(new Uri(rabbitUrl));
                    cfg.ConfigureEndpoints(context);

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
                    builder
                        .WithOrigins(
                            "https://localhost:5005",
                            "http://localhost:5005",
                            "https://localhost:7259",
                            "https://localhost:7173",
                            "http://localhost:5138",
                            "https://rdoegito.github.io",
                            "https://fetchdesk.pages.dev")
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
            //if (app.Environment.IsDevelopment())
            //{
                app.UseSwagger();
                app.UseSwaggerUI();
                app.MapOpenApi();
            //}

            app.MapHub<OrderHub>("/orderhub");

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapEndpoints();

            //using (var scope = app.Services.CreateScope())
            //{
            //    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            //    dbContext.Database.Migrate();
            //}

            app.Run();
        }
    }
}
