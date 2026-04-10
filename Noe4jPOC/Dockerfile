# ── Stage 1: Build ────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy csproj and restore first (layer caching)
COPY Neo4JPOC/Neo4JPOC.csproj Neo4JPOC/
RUN dotnet restore Neo4JPOC/Neo4JPOC.csproj

# Copy the rest and publish (single step, uses restored cache)
COPY Neo4JPOC/ Neo4JPOC/
RUN dotnet publish Neo4JPOC/Neo4JPOC.csproj \
      -c Release \
      -o /app/publish

# ── Stage 2: Runtime ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 5081

ENV ASPNETCORE_URLS=http://+:5081
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Neo4JPOC.dll"]
