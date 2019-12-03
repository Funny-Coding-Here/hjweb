import React, { Component } from 'react';
import { CardElement} from 'react-stripe-elements';

var a = 0;
export default class RenderCard extends Component {
    constructor(props) {
        super(props);
        console.log('=-=================INITIAL===============');
    }
    render() {
        a += 1;
        console.log('RENDEREE___________________________');
        console.log(a);
        return <CardElement style={{ base: { fontSize: '18px' } }} />
    }
}