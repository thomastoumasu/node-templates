// now can separate Display and Button into separate components
import { useCounterValue, useCounterDispatch } from './CounterContext'

const Display = () => {
  const counter = useCounterValue()
  return (
    <div>
      {counter}
    </div>
  )
}

const Button = ({ type, text }) => {
  const useCounter = useCounterDispatch()
  return (
    <button onClick={() => useCounter({ type })}>{text}</button>
  )
}

const App = () => {
  return (
    <>
      <Display />
      <div>
        <Button type='+' text='+' />
        <Button type='-' text='-' />
        <Button type='0' text='0' />
      </div>
    </>
  )
}

export default App
