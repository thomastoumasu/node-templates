import { useState, useEffect } from 'react'
import weatherService from '../services/weather.js'

const Weather = ({capital, latlng}) => {
  const [weather, setWeather] = useState(null)

  useEffect(() => { // fetch weather on every first rendering
    weatherService
      .getWeather(latlng[0], latlng[1])
      .then(data => setWeather(data))
  }, [])

  if (!weather) { return null }
  else return (
    <>
      <h2> Weather in {capital} </h2>
      <p> Temperature: {(parseFloat(weather.main.temp) - 273.15).toFixed(1)} °C </p>
      <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} />
      <p> Wind: {weather.wind.speed} m/s </p>
{/*       <pre>{JSON.stringify(weather, null, 2)}</pre> */}
    </>
  )
}

export default Weather



