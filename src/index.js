import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Checkout from './Checkout';
import Thankyou from './Thankyou';
import * as serviceWorker from './serviceWorker';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import Firebase, { FirebaseContext } from './Firebase';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { StripeProvider, Elements } from 'react-stripe-elements';
import 'font-awesome/css/font-awesome.min.css';


// optional cofiguration
const options = {
    // you can also just use 'bottom center'
    position: positions.TOP_CENTER,
    timeout: 5000,
    offset: '30px',
    type: 'error',
    // you can also just use 'scale'
    transition: transitions.SCALE
}

const customTheme = createMuiTheme({
    palette: {
        primary: {
            light: '#ffff52',
            main: '#ffd300',
            dark: '#c7a200',
            contrastText: '#000',
        },
        secondary: {
            light: '#ff7539',
            main: '#ff3d00',
            dark: '#c30000',
            contrastText: '#fafafa',
        },
    }
})


const routing = (

    <AlertProvider template={AlertTemplate} {...options}>
        <FirebaseContext.Provider value={new Firebase()}>
            <Router>
                <div>
                    <MuiThemeProvider theme={customTheme}>
                        <Route exact path="/" component={App} />
                        {/** pk_test_TYooMQauvdEDq54NiTphI7jx*/}
                        <StripeProvider apiKey="pk_live_8JDDNE0MmQtBFtDnOnKfYRmq00DCsVQz21">
                            <Elements>
                                <Route path="/checkout" component={Checkout} />
                            </Elements>
                        </StripeProvider>
                        <Route path="/thankyou" component={Thankyou} />
                    </MuiThemeProvider>
                </div>
            </Router>
        </FirebaseContext.Provider>
    </AlertProvider>
)

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
