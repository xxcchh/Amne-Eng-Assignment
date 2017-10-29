import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import Distance from './Distance'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<Distance />, document.getElementById('function'));
registerServiceWorker();
