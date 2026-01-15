import { useState } from 'react'

const toFixedIfNecessary = // helper function to format numbers
  (value, dp) => +parseFloat(value).toFixed(dp)

const Header = ({text}) => <h1>{text}</h1>

const Button = ({onClick, text}) =>
    <button onClick={onClick}>{text}</button>

const Buttons = ({buttons}) => {
  return (
      <>
      <Button onClick={buttons[0].handle} text={buttons[0].text}/>
      <Button onClick={buttons[1].handle} text={buttons[1].text}/>
      <Button onClick={buttons[2].handle} text={buttons[2].text}/>
      </>
  )
}

const StatisticLine = ({text, value, unit}) =>
  <tr><td>{text}</td><td>{value}</td><td>{unit}</td></tr>

const Statistics = ({title, stats}) => {
  const [good, neutral, bad] = stats
  const all = good + neutral + bad
  const average = toFixedIfNecessary((good - bad) / all, 2)  // good = 1, neutral = 0, bad = -1
  const positive = toFixedIfNecessary(good / all * 100, 2)

  const textWhenNoFeedbackYet = 'No feedback given'

  if (all === 0) { // no feedback given yet
    return(
    <>
      <h1>{title}</h1>
      <p>{textWhenNoFeedbackYet}</p>
    </>
    )
  }
  return( // feedback has been given at least one time, so show statistics
    <>
      <h1>{title}</h1>
      <table>
        <tbody>
          <StatisticLine text='good'      value={good} />
          <StatisticLine text='neutral'   value={neutral} />
          <StatisticLine text='bad'       value={bad} />
          <StatisticLine text='all'       value={all} />
          <StatisticLine text='average'   value={average} />
          <StatisticLine text='positive'  value={positive} unit='%'/>
        </tbody>
      </table>
    </>
  )
}

const App = () => {
  // states
  const [ good, setGood ] = useState(0)
  const [ neutral, setNeutral ] = useState(0)
  const [ bad, setBad ] = useState(0)

  // button handlers
  const handleGood = () => setGood(good + 1)
  const handleNeutral = () => setNeutral(neutral + 1)
  const handleBad = () => setBad(bad + 1)

  const headerText = 'give feedback'
  const statTitle = 'statistics'
  const buttons = [
    { handle: handleGood,     text: 'good' },
    { handle: handleNeutral,  text: 'neutral' },
    { handle: handleBad,      text: 'bad' }
  ]
  const stats = [good, neutral, bad]

  return (
    <div>
      <Header text={headerText} />
      <Buttons buttons={buttons} />
      <Statistics title={statTitle} stats={stats} />
    </div>
  )
}

export default App

