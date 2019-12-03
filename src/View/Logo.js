import React, { useEffect, useState } from 'react';

import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import GoogleMapReact from 'google-map-react';
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import hlp from '../helper';

const AnyReactComponent = ({ text }) => <div className="TopButtons" style={{ width: 300, alignItems: 'center' }}>
    <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" color='#f00' />
    <div style={{ paddingLeft: 15 }}>
        <h2>{text}</h2>
        <p style={{ marginBlockStart: 0, marginBlockEnd: 0, fontSize: 14 }}>Bubble tea shop</p>
        <p style={{ marginBlockStart: 0, marginBlockEnd: 0, fontSize: 14 }}>with Taiwanese fare</p>
    </div>
</div>;

export default function Logo(props) {
    const { height, width } = hlp.useWindowDimensions();
    console.log("******************************",props.business.Customization.Banner)
    
    return props.mapFlag ? 
    <Grid container spacing={0} >

        <Hidden smDown >
            <Grid item md={8}
                style={
                    {
                        height: width * 0.3,
                        minHeight: 200,
                        background: `url(${props.business.Customization.Banner})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                    }
                }
            />
        </Hidden>
        <Grid item md={4} xs={12} sm={12} style={{minHeight: 200}}>
            <GoogleMapReact
                bootstrapURLKeys={
                    { key: "AIzaSyC0aU-FNMFL1hXT9hgbzSDN4824qvy7fxk" }
                }
                defaultCenter={
                    {
                        lat: props.business['_geoloc'].lat,
                        lng: props.business['_geoloc'].lng
                    }
                }
                defaultZoom={15} >
                <AnyReactComponent
                    lat={props.business['_geoloc'].lat}
                    lng={props.business['_geoloc'].lng}
                    text="Hello Jas" />
            </GoogleMapReact>
        </Grid >
    </Grid > : <Grid container spacing={0} >
            <Grid item md={8}
                xs={12}
                sm={12}
                style={
                    {
                        height: width * 0.3,
                        minHeight: 200,
                        background: `url(${props.business.Customization.Banner})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                    }
                }
            />
            <Hidden smDown >
                <Grid item md={4} >
                    <GoogleMapReact
                        bootstrapURLKeys={
                            { key: "AIzaSyC0aU-FNMFL1hXT9hgbzSDN4824qvy7fxk" }
                        }
                        defaultCenter={
                            {
                                lat: props.business['_geoloc'].lat,
                                lng: props.business['_geoloc'].lng
                            }
                        }
                        defaultZoom={15} >
                        <AnyReactComponent
                            lat={props.business['_geoloc'].lat}
                            lng={props.business['_geoloc'].lng}
                            text="Hello Jasmine" />
                    </GoogleMapReact>
                </Grid >
            </Hidden>
        </Grid >
};