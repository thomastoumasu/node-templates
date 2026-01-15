import axios from 'axios'
const weatherURL = 'https://api.openweathermap.org/data/2.5/weather?'
const api_key = import.meta.env.VITE_OWM_KEY

const getWeather = (lat, lon) => {
  const url = `${weatherURL}lat=${lat}&lon=${lon}&exclude=hourly,daily,minutely,alerts&appid=${api_key}`
  console.log(`fetching weather from ${url}`)
  return axios
    .get(url)
    .then(response => {
      console.log('got response from server: ', response.data)
      return response.data
    })
}

export default { getWeather }