import React, { Fragment } from 'react'
import Navbar from './component/lavout/Navbar'
import Landing from './component/lavout/Landing'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Register from './component/auth/Register';
import Login from './component/auth/Login';
import './App.css'

function App() {
  return (
    <Router>
      <Fragment>
        <Navbar />
        <Route exact path='/' component={Landing} />
        <section className="container">
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
        </section>
      </Fragment>
    </Router>
  )
}

export default App;
