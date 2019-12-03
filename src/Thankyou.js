import React, { useEffect, useState, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import { faMapMarkedAlt, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { withFirebase } from './Firebase';
import './App.css';
import FooterBar from './View/FooterBar';
import hlp from './helper';
import Logo from './View/Logo';


const AnyReactComponent = ({ text }) => <div className="TopButtons" style={{ width: 300, alignItems: 'center' }}>
    <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" color='#f00' />
    <div style={{ paddingLeft: 15 }}>
        <h2>{text}</h2>
        <p style={{ marginBlockStart: 0, marginBlockEnd: 0, fontSize: 14 }}>Bubble tea shop</p>
        <p style={{ marginBlockStart: 0, marginBlockEnd: 0, fontSize: 14 }}>with Taiwanese fare</p>
    </div>
</div>;

function Thankyou(props) {
    const [called, setCalled] = useState(1);
    const [position, setPosition] = useState(props.firebase.getPosition());
    const { height, width } = hlp.useWindowDimensions();
    let business = props.firebase.business;
    let mobileFlag = 0;
    if (width < 500) {
        mobileFlag = 1;
    }
    const res = props.firebase.result;
    if (!business) {
        props.history.push('/');
        return <div></div>;
    }
    return <div>
        <Card className="TopBar">
            <p style={{ fontWeight: 'bold', fontSize: 18 }} >{props.firebase.type === 'ONLINE_PICKUP' ? "Pick Up" : "Delivery"}</p>
        </Card>
        <div style={{ height: 70 + (1 - mobileFlag) * 20 }} />
        <div className="App" style={{ paddingLeft: width / 20, paddingRight: width / 20 }} >
            <Grid container
                direction="row"
                justify="space-between"
            >
                {res.error &&
                    <Grid item md={5} sm={12} xs={12}>
                        <p>Network Error please retry</p>
                    </Grid>
                }
                {res.data &&
                    <Grid item md={5} sm={12} xs={12}>
                        <h3>Thank you {props.firebase.name}!</h3>
                        <p style={{ marginBlockEnd: 0, fontSize: 16 }}>Your order has been placed successfully!</p>
                        <p style={{ fontSize: 16 }}>Please check your conformation email.</p>
                    </Grid>
                }
                <Grid item md={5} sm={12} xs={12}>
                    <Card style={{ marginBottom: 20 }}>
                        <div style={{ margin: width / 60 }}>
                            <h3>Order # {res.data ? res.data.Order_number : ''}</h3>
                            <div className="TopButtons">
                                <FontAwesomeIcon icon={faMapMarkedAlt} size="lg" />
                                <p style={{ marginBlockStart: 0, marginBlockEnd: 0, paddingLeft: 20 }}>{props.firebase.type === 'ONLINE_PICKUP' ? business.Addr.Street : position}</p>
                            </div>
                            <div className="TopButtons">
                                <i className="material-icons">alarm</i>
                                <p style={{ marginBlockStart: 0, marginBlockEnd: 0, paddingLeft: 20 }}>{business.Estimate_time_min - 5}-{business.Estimate_time_min + 5} min Estimated</p>
                            </div>
                            <div className="TopButtons">
                                <i className="material-icons">alarm</i>
                                <p style={{ marginBlockStart: 0, marginBlockEnd: 0, paddingLeft: 20 }}>{business.Phone ? business.Phone : ""}</p>
                            </div>
                        </div>
                    </Card>
                </Grid>
            </Grid>
        </div>
        {
            business ? // If Business information has fetched
                <Logo business={business} mapFlag={true} /> : null
        }
        <FooterBar />
    </div>
}

export default withFirebase(Thankyou);