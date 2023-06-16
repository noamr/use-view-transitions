import React from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'
import { SquareWithImmediateTransition } from "./immediate";
import { SquareWithDelayedTransition} from "./delayed";
import "./App.css";
import { MooodPicker } from './mood-picker';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <h2>Immediate transition:</h2>
    <SquareWithImmediateTransition />
    <h2>Suspended Transition:</h2>
    <SquareWithDelayedTransition />
    <h2>Mood picker:</h2>
    <MooodPicker />
  </React.StrictMode>,
)
