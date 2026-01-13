FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY SmartHotel.sln ./
COPY SmartHotel.Backend/ SmartHotel.Backend/

RUN dotnet restore "SmartHotel.Backend/SmartHotel.Backend.csproj"
RUN dotnet publish "SmartHotel.Backend/SmartHotel.Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000

COPY --from=build /app/publish .

EXPOSE 5000

ENTRYPOINT ["dotnet", "SmartHotel.Backend.dll"]

