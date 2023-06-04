import React from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'
import { SquareWithImmediateTransition } from "./immediate";
import { SquareWithDelayedTransition} from "./delayed";
import "./App.css";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    Immediate transition:
    <SquareWithImmediateTransition />
    Suspended Transition:
    <SquareWithDelayedTransition />
  </React.StrictMode>,
)
