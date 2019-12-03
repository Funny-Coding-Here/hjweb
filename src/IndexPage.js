import React from 'react';
import { Link } from 'react-router-dom';

export default class IndexPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingFlag: true
        }
    }

    componentDidMount() {
        this.setState({loadingFlag: false});
    }

    render() {
        return this.state.loadingFlag ? <p style={{ marginLeft: 20, marginTop: 20 }}>Loading....</p> : <div style={{ marginLeft: 20, marginTop: 20 }}>
            <div>
                <Link to="/">First Business</Link>
            </div>
            <div>
                <Link to="/about">Second Business</Link>
            </div>
        </div>
    }
}