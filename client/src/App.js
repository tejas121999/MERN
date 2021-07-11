import React, { Fragment } from 'react'
import Navbar from './component/lavout/Navbar'
import Landing from './component/lavout/Landing'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Register from './component/auth/Register';
import Login from './component/auth/Login';
import './App.css'

// Redux
import { Provider } from 'react-redux';
import store from './store';

function App() {
  return (
    <Provider store={store}>
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
    </Provider>
  )
}

export default App;
