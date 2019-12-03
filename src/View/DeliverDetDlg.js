import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import { useAlert } from 'react-alert';

export default function DeliverDetDlg(props) {
    const alert = useAlert();
    const [position, setPosition] = useState('');
    const [deliverStatus, setDeliverStatus] = useState(0);
    const [second, setSecond] = useState('');
    const [btnText, setBtnText] = useState('Continue');
    
    const onDeliverContinue = async () => {
        if (deliverStatus == 1) {
            props.handleClose();
        } else {
            let res = await props.getLatLong(position);
            if (res == 2) {
                // Success
                setSecond('Yeah! You are in the delivery range.');
            } else if (res == 1) {
                // Not Deliver Range
                setSecond('Outside of delivery Range!');
                setBtnText('Switch to pickup');
            } else {
                // Something Went Wrong
                setSecond('Something Went Wrong!');
            }
            setDeliverStatus(1);
        }
    }

    return <div style={props.mobileFlag? {} : {width: 400}}>
        <IconButton onClick={props.handleClose} >
            <i className="material-icons" > close </i> </IconButton >
        <div style={{ paddingLeft: 30, paddingRight: 30 }}>
            {
                deliverStatus ?
                    <p>{second}</p> :
                    <div>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>Does this restaurant deliver to you?</p>
                        <p>Before starting your order, tell us your address.</p>
                    </div>
            }
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Address"
                value={position}
                onChange={event => setPosition(event.target.value)}
                fullWidth
            />
            <DialogActions>
                <Button variant='contained' onClick={onDeliverContinue} color="primary">{btnText}</Button>
            </DialogActions>
        </div>
    </div >
}