# Weather App

A simple responsive weather application that lets users search for a city
and view its current weather and three-day forecast.

The app uses the free Open-Meteo APIs and does not require an API key.

## Description

Users can enter a city name into the search box. The application first uses
Open-Meteo's geocoding API to find the city's latitude and longitude. It then
uses those coordinates to request current weather and daily forecast data.

The app displays:

- City name
- Current temperature
- Weather emoji
- Weather description
- Wind speed
- Three-day forecast
- Daily maximum and minimum temperatures

## Features

- Search for cities worldwide
- Current temperature in Celsius
- Current wind speed in kilometres per hour
- Weather descriptions and emojis
- Three-day forecast
- Loading message while data is being fetched
- Friendly error messages
- Search using the button or the Enter key
- Responsive mobile layout
- No API key required

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Fetch API
- Async/await
- Open-Meteo APIs

## API Used

This project uses Open-Meteo.

Website:

https://open-meteo.com/

### Geocoding API

The geocoding API converts a city name into coordinates.

Example:

```text
https://geocoding-api.open-meteo.com/v1/search?name=Chennai&count=1&language=en&format=json
