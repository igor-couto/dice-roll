# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine3.20-arm64v8 AS build
RUN apk add --no-cache icu-libs
WORKDIR /source
COPY . .
RUN dotnet restore src --disable-parallel --runtime linux-musl-arm64
RUN dotnet publish src -c Release -o /app --no-restore --runtime linux-musl-arm64 --self-contained true

# Serve Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine3.20-arm64v8 AS run
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
ENV ASPNETCORE_URLS="http://+:50050"
ENV ASPNETCORE_HTTP_PORT=50050

WORKDIR /app
COPY --from=build /app .

EXPOSE 50050

ENTRYPOINT ["./DiceRoll"]