# Estágio de Build - Atualizado para 10.0
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar arquivos de projeto
COPY ["FetchDesk.Client/FetchDesk.Client.csproj", "FetchDesk.Client/"]
COPY ["FetchDesk.Shared/FetchDesk.Shared.csproj", "FetchDesk.Shared/"]
RUN dotnet restore "FetchDesk.Client/FetchDesk.Client.csproj"

# Copiar tudo e publicar
COPY . .
WORKDIR "/src/FetchDesk.Client"
RUN dotnet publish "FetchDesk.Client.csproj" -c Release -o /app/publish

# Servir com Nginx (mantém igual)
FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html
COPY --from=build /app/publish/wwwroot .
COPY FetchDesk.Client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80