import React, { useState, useEffect } from 'react';
import { fetchGeocodeApi, fetchWeatherApi } from 'openmeteo';
import { StyleSheet, Image, View, Text } from 'react-native';
import { Table, Row } from 'react-native-table-component';

export const weatherCodeRanges = {
  Sunny: [0],
  Cloudy: [1, 2, 3, 45, 48],
  Rain: [51, 53, 55, 61, 63, 65, 66, 67, 77, 80, 81, 82],
  Snow: [71, 73, 75, 85, 86],
  Thunderstorm: [95, 96, 99],
};

export const weatherImages = {
  Sunny: require('../../../assets/weatherSunny.png'),
  Cloudy: require('../../../assets/weatherCloudy.png'),
  Rain: require('../../../assets/weatherRain.png'),
  Snow: require('../../../assets/weatherSnow.png'),
  Thunderstorm: require('../../../assets/weatherThunderstorm.png'),
};

const WeatherForm = ({ location }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      handleSubmit();
    }
  }, [location]);

  const fetchGeocodeData = async (city) => {
    try {
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      const latitude = data.results[0].latitude;
      const longitude = data.results[0].longitude;

      return { latitude, longitude };
    } catch (error) {
      console.error('Error fetching geocode data:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      const { latitude, longitude } = await fetchGeocodeData(location);

      const params = {
        latitude: [latitude],
        longitude: [longitude],
        current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m',
        hourly: 'temperature_2m,precipitation',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      };
      const url = 'https://api.open-meteo.com/v1/forecast';
      const responses = await fetchWeatherApi(url, params);

      const response = responses[0];

      const utcOffsetSeconds = response.utcOffsetSeconds();
      const daily = response.daily();

      const dailyWeather = daily
        ? {
            time: range(
              Number(daily.time()),
              Number(daily.timeEnd()),
              daily.interval()
            ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
            weatherCode: daily.variables(0).valuesArray(),
            temperatureMax: daily.variables(1).valuesArray(),
            temperatureMin: daily.variables(2).valuesArray(),
          }
        : null;

      setWeatherData({ daily: dailyWeather });
      setError(null);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Error fetching weather data. Please try again.');
      setWeatherData(null);
    }
  };

  const range = (start, stop, step) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  const getWeatherCategory = (weatherCode) => {
    for (const category in weatherCodeRanges) {
      if (weatherCodeRanges[category].includes(weatherCode)) {
        return category;
      }
    }
    return 'Sunny';
  };
    const renderWeatherTable = () => {
      if (!weatherData || !weatherData.daily) {
        return null;
      }
    
      const { time, weatherCode, temperatureMax, temperatureMin } = weatherData.daily;
    
      return (
        <Table style={{ width: '100%' }} borderStyle={{ borderWidth: 1 }}>
          <Row
            data={['', ...time.map((_, index) => (
              <View key={index} style={styles.weatherRow}>
                <Image
                  source={weatherImages[getWeatherCategory(weatherCode[index])]}
                  style={styles.weatherImage}
                />
                <Text style={styles.temperatureText}>
                  {`${Math.round((temperatureMax[index] * 9) / 5 + 32)}°F`}
                </Text>
              </View>
            )), '']}
            textStyle={styles.text}
          />
        </Table>
      );
    };

  return (
    <View style={styles.container}>
      {renderWeatherTable()}
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  emptyBox: { flex: 1 },
  weatherBox: { flex: 1, alignItems: 'center' },
  weatherImage: { height: 50, width: 50 },
  temperatureText: { fontSize: 32 },
  weatherTableContainer: {
    width: '70%', // Adjust the width as needed
  },
});

export default WeatherForm;
