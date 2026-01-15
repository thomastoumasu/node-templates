import { useState, useEffect } from 'react'
import countryService from './services/countries.js'
import DetailedCountry from './components/DetailedCountry'

const Country = ({country, showOne}) => {
  return(
    <div>
      {country} <button onClick={() => showOne(country)}>Show</button>
{/*       {country} <button onClick={showOne(country)}>view</button> */}
    </div>
  )
}

const Countries = ({countries, showOne}) =>
  countries.map(country =>
    <Country country={country} key={country} showOne={showOne}/>
  )

const Display = ({display, showOne}) => {
  switch (display.type) {
    case 'no match':
      return <p>no matches</p>
    case 'one match':
      return <DetailedCountry country={display.countries[0]}/>
    case 'some matches':
      return <Countries countries={display.countries} showOne={showOne}/>
    case 'too many matches':
      return <p>too many matches</p>
    default:
      return null
  }
}

function App() {
  const [countryNames, setCountryNames] = useState([])
  const [value, setValue] = useState('')
  const [display, setDisplay] = useState({type: 'too many matches', countries:[]})

  const showCountry = (country) => {
    console.log('show button clicked on', country)
    setDisplay({type: 'one match', countries: [country]})
    setValue(country.toLowerCase())
  }

//     const showCountry = country => { // returns a button onClick Handler of the form () => something
//     console.log('show button clicked')
//     return(
//       () => {
//         setDisplay({type: 'one match', countries: [country]})
//         setValue(country.toLowerCase())
//       }
//     )
//   }

  const findCountries = (event) => {
    setValue(event.target.value)

    const matchedCountries = countryNames.filter(countryName =>
      countryName.toLowerCase().includes(event.target.value.toLowerCase()))
    console.log('found: ', matchedCountries)

    if (matchedCountries.length > 10) {
      setDisplay({type: 'too many matches', countries: []})
    } else if (matchedCountries.length === 1) {
      setDisplay({type: 'one match', countries: matchedCountries})
    } else if (matchedCountries.length === 0) {
      setDisplay({type: 'no match', countries: []})
    } else {
      setDisplay({type: 'some matches', countries: matchedCountries})
    }
  }

  useEffect(() => { // fetch country names, only once on first rendering
    countryService
      .getCountryNames()
      .then(names => setCountryNames(names))
  }, [])

  return (
    <>
      <div style={{paddingBottom: 20}}>
        find countries <input value={value} onChange={findCountries} />
      </div>
      <Display display={display} showOne={showCountry}/>
    </>
  )
}

export default App



