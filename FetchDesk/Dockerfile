# Estágio de Build - Atualizado para 10.0
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar arquivos de projeto e restaurar dependências
COPY ["FetchDesk/FetchDesk.csproj", "FetchDesk/"]
COPY ["FetchDesk.Shared/FetchDesk.Shared.csproj", "FetchDesk.Shared/"]
RUN dotnet restore "FetchDesk/FetchDesk.csproj"

# Copiar o restante do código e compilar
COPY . .
WORKDIR "/src/FetchDesk"
RUN dotnet build "FetchDesk.csproj" -c Release -o /app/build

# Publicar
FROM build AS publish
RUN dotnet publish "FetchDesk.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio Final - Atualizado para 10.0
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FetchDesk.dll"]