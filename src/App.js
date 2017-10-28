import React, { Component } from 'react'
import company from './AmneLogo.png'
import './App.css'

function getHello(hello){
  if (hello){
    return <p className="App-intro">{hello}</p>;
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={company} className="App-company" alt="amne" size="20x20" />
          <h1 className="App-title">Welcome to Amne</h1>
        </header>
        {getHello()}
      </div>
    );
  }
}

export default App;
