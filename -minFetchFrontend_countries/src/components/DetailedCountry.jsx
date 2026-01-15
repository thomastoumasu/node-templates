import { useState, useEffect } from 'react'
import countryService from '../services/countries.js'
import Weather from '../components/Weather'

const Language = ({languages}) => {
  return(
    <>
      <h2>{(Object.keys(languages).length > 1) ? 'Languages' : 'Language'}</h2>
      <ul>
        {Object.keys(languages).map(language =>
          <li key={language}> {languages[language]} </li>
        )}
      </ul>
    </>
  )
}

const Currency = ({currencies}) => {
  return(
    <>
      <h2>{(Object.keys(currencies).length > 1) ? 'Currencies' : 'Currency'}</h2>
      <ul>
        {Object.keys(currencies).map(currency =>
          <li key={currency}> {currencies[currency].name} ({currencies[currency].symbol}) </li>
        )}
      </ul>
    </>
  )
}

const Capital = ({capital}) => {
  return(
    <>
      <h2>{(capital.length > 1) ? 'Capitals' : 'Capital'}</h2>
      <ul>
        {capital.map(e =>
          <li key={e}> {e} </li>
        )}
      </ul>
    </>
  )
}

const Gini = ({gini}) => {
  return(
    <>
      {Object.keys(gini || []).map(year =>
        <p key={year}> Gini coefficient ({year}): {gini[year]} </p>
      )}
    </>
  )
}

const DetailedCountry = ({country}) => {
  const [infos, setInfos] = useState(null)

  useEffect(() => { // fetch country info when country changes
    countryService
      .getCountryInfo(country)
      .then(data => {
        setInfos(data)
      })
  }, [country])

  if (!infos) { return null }
  else return (
    <>
      <img src={infos.flags.png} width="300"/>
      <h1> {infos.name.common} </h1>
      <p> Official name: {infos.name.official}</p>
      <Capital capital={infos.capital} />
      <Language languages={infos.languages} />
      <Currency currencies={infos.currencies} />
      <Gini gini={infos.gini} />
      <img src={infos.coatOfArms.png} width="300"/>
      <Weather latlng={infos.capitalInfo.latlng} capital={infos.capital[0]} />
{/*       <pre>{JSON.stringify(infos, null, 2)}</pre> */}
    </>
  )
}

export default DetailedCountry



