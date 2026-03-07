# Base image for running the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Build image with SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["fetch-desk/fetch-desk.csproj", "fetch-desk/"]
RUN dotnet restore "./fetch-desk/fetch-desk.csproj"

# Copy the remaining source code and build
COPY . .
WORKDIR "/src/fetch-desk"
RUN dotnet build "./fetch-desk.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish the application
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./fetch-desk.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final image configuration
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "fetch-desk.dll"]