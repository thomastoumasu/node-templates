import axios from 'axios'
const countriesURL = 'https://studies.cs.helsinki.fi/restcountries/api/'

const getCountryNames = () => { // return all country names
  const url = `${countriesURL}all`
  console.log(`fetching all country names from ${url}`)
  return axios
    .get(url)
    .then(response => {
      const names = response.data.map(e => e.name.common)
      console.log('got response from server: ', names)
      return names
    })
}

const getCountryInfo = (country) => { // return country info for one country
  const url = `${countriesURL}name/${country}`
  console.log(`fetching country info for ${country} from ${url}`)
  return axios
    .get(url)
    .then(response => response.data)
}

export default { getCountryNames, getCountryInfo }