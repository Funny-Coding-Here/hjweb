import React, { useEffect, useState, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import GoogleMapReact from 'google-map-react';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import { faMapMarkedAlt, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Checkbox from '@material-ui/core/Checkbox';
import { AccountCircle, Phone, Email, CreditCard } from '@material-ui/icons';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import LoadingOverlay from 'react-loading-overlay';
import { injectStripe } from 'react-stripe-elements';
import { withFirebase } from './Firebase';
import './App.css';
import FooterBar from './View/FooterBar';
import RenderCard from './View/RenderCard';
import hlp from './helper';
var moment = require('moment');

var name = '';
var phone = '';
var email = '';
var cardNumber = '';

const AnyReactComponent = ({ text }) => <div className="TopButtons" style={{ width: 300, alignItems: 'center' }}>
    <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" color='#f00' />
    <div style={{ paddingLeft: 15 }}>
        <h2>{text}</h2>
        <p style={{ marginBlockStart: 0, marginBlockEnd: 0, fontSize: 14 }}>Bubble tea shop</p>
        <p style={{ marginBlockStart: 0, marginBlockEnd: 0, fontSize: 14 }}>with Taiwanese fare</p>
    </div>
</div>;

var editId = 0;
var price = 0;

function Checkout(props) {
    const [called, setCalled] = useState(1);
    const { height, width } = hlp.useWindowDimensions();
    const [position, setPosition] = useState(props.firebase.getPosition());
    const [doneContactInfo, setDoneContactInfo] = useState(false);
    const [flagPayment, setFlagPayment] = useState('edit');
    const [selItem, setSelItem] = useState(null);
    const [selCount, setSelCount] = useState(1);
    const [selInfo, setSelInfo] = useState({});
    const [editDetDlg, setEditDetDlg] = useState(false);
    const [tipValue, setTipValue] = useState(-1);
    const [loadingOver, setLoadingOver] = useState(false);

    let placeOrderTxt = "";
    let subtotal = 0;
    let total = 0;
    let tax = 0;
    let tip = 0;

    let orderItems = props.firebase.getOrders();
    let modis = props.firebase.modis;
    let business = props.firebase.business;
    let type = props.firebase.type;
    console.log(orderItems);
    let mobileFlag = 0;
    if (width < 500) {
        mobileFlag = 1;
    }

    const onPlaceOrder = async (props) => {
        if (name == '' || phone == '' || email == '') return;
        setLoadingOver(true);
        let now = moment(new Date).add(business.Estimate_time_min, 'm').format('LLL');
        console.log('=====================');
        let items = [];
        const item_ids = {};
        console.log(modis);
        console.log(orderItems);
        orderItems.forEach((oItem) => {
            let cmo = [];
            for (let key in oItem.info) {
                if (modis[key]['Multi_choices']) {
                    modis[key].Options.forEach((ch) => {
                        console.log(oItem.info[key]);
                        for (let t in oItem.info[key]) {
                            if (t == ch.Name) {
                                cmo.push({
                                    Chosen_option: ch.Name,
                                    Chosen_option_cn: ch.Name_cn,
                                    Price_offset: ch.Price_offset,
                                });
                            }
                        }
                    });
                } else {
                    modis[key].Options.forEach((ch) => {
                        if (ch.Name == oItem.info[key]) {
                            cmo.push({
                                Chosen_option: ch.Name,
                                Chosen_option_cn: ch.Name_cn,
                                Price_offset: ch.Price_offset,
                            });
                        }
                    });
                }
            }
            let count = item_ids[oItem.item.id] || 0;
            item_ids[oItem.item.id] = count + oItem.count;
            items.push({
                Price: oItem.item.Price,
                Name: oItem.item.Name,
                Name_cn: oItem.item.Name_cn,
                Discount: [],
                Chosen_modifiers_options: cmo,
                Category: oItem.item.Category,
                Comments: ""
            });
        });
        console.log(item_ids);
        console.log({
            type: 'card',
            amount: Number((total * 100).toFixed(0)),
            owner: {
                name: name,
                phone: phone,
                email: email,
            },
            usage: "single_use"
        });
        let striprRes = await props.stripe.createSource({
            type: 'card',
            amount: Number((total * 100).toFixed(0)),
            //amount: 50,
            owner: {
                name: name,
                phone: phone,
                email: email,
            },
            usage: "single_use"
        })
        console.log(striprRes);
        if (striprRes['error']) {
            setLoadingOver(false);
            props.firebase.setResult(striprRes);
            props.history.push('/thankyou');
            return;
        }
        let param = {
            SourceId: striprRes['source']['id'],
            Comments: "test comments",
            Order_from: "WEB",
            BusinessId: props.firebase.businessId,
            Total_price: Number(total.toFixed(2)),
            //Total_price: 50,
            Tips: Number(tip.toFixed(2)),
            Tax: Number(tax.toFixed(2)),
            Discount: [],
            Items: items,
            Item_ids: item_ids,
            Pickup_detail: {
                Pickup_time: now,
                Phone_number: phone,
                Name: name,

            },
            Type: props.firebase.getType(),
            Delivery_detail: {
                Address: props.firebase.getPosition(),
                Phone_number: phone,
                Delivery_time: now,
                Delivery_fee: 4,
                Name: name
            },
            Email: email,
            Online_order_acceptance: 'True'
        };
        console.log(param);
        const token = await props.firebase.getIdToken();
        console.log(token);
        hlp.post('https://us-central1-infishare-client.cloudfunctions.net/onlineChargeCust',
            param, token).then((result) => {
                console.log('==HERE RESULT==');
                console.log(result);
                setLoadingOver(false);
                props.firebase.setName(name);
                props.firebase.setResult(result);
                props.history.push('/thankyou');
            })
    }

    const onContactInfoDone = () => {
        setDoneContactInfo(true);
        if (flagPayment == 'hide') {
            setFlagPayment('edit');
        }
    }

    const onDonePayment = () => {
        setFlagPayment('show');
    }

    const handleClose = () => {
        setEditDetDlg(false);
    };


    const calculatePrice = () => {
        price += selCount * selItem.Price;
        for (let key in selInfo) {
            if (modis[key]['Multi_choices']) {
                for (let modi in selInfo[key]) {
                    if (selInfo[key][modi]) {
                        for (let t in modis[key]['Options']) {
                            if (modis[key]['Options'][t].Name == modi) {
                                price += selCount * modis[key]['Options'][t].Price_offset;
                            }
                        }
                    }
                }
            }
        }
    }

    const getToppings = (info) => {
        let topping = 0;
        for (let key in info) {
            if (modis[key]['Multi_choices']) {
                for (let modi in info[key]) {
                    if (info[key][modi]) {
                        for (let t in modis[key]['Options']) {
                            if (modis[key]['Options'][t].Name == modi) {
                                topping += modis[key]['Options'][t].Price_offset;
                            }
                        }
                    }
                }
            }
        }
        return topping;
    }

    const onUpdateOrder = () => {
        handleClose();
        price = 0;
        calculatePrice();
        let item = {
            item: selItem,
            count: selCount,
            info: selInfo,
            price: price
        }
        props.firebase.updateOneOrder(item, editId);
    }

    const RenderEditItemDetFooter = () => (
        mobileFlag ?
            <div className={'MobileBottomView'}>
                <RenderItemDetWebFooter />
            </div>
            : null)

    const onRemoveOrderItem = (item, id) => {
        if (item.count < 1) {
            return;
        }
        console.log('Here Remove Order Item');
        console.log(item);
        console.log(orderItems[id]);
        item.count -= 1;
        item.price -= item.item.Price;
        item.price -= getToppings(item.info);
        setCalled(called + 1);
    }

    const onAddOrderItem = (item, id) => {
        console.log('Here Add Order Item');
        console.log(item);
        console.log(orderItems[id]);
        item.count += 1;
        item.price += item.item.Price;
        item.price += getToppings(item.info);
        setCalled(called + 1);
    }

    const calculate = () => {
        orderItems.forEach((item) => {
            subtotal += item.price;
            let tmp = false;
            item.item['Tax_class'].forEach((txv) => {
                for (let key in business.Tax) {
                    if (key == txv) {
                        tax += item.price * business.Tax[key] / 100;
                        tmp = true;
                    }
                }
            })
            if (!tmp) tax += item.price * business.Tax['base'] / 100;
        });
        tip = subtotal * Math.max(tipValue, 0) / 100;
        total = subtotal + tax + tip;
        if (type === 'ONLINE_DELIVERY') total += 4;
    }

    calculate();


    const RenderItemDetWebFooter = () => (
        < DialogActions style={{ backgroundColor: 'white' }
        }>
            <Button variant='contained' onClick={onUpdateOrder} color="primary">Update Order</Button>
        </DialogActions >)

    // Render Item Detail Dialog Header
    const RenderItemDetHeader = (props) => (
        <div
            style={{
                position: 'fixed',
                zIndex: 2,
                backgroundColor: 'white',
                width: Math.min(540, width - 20),
                paddingLeft: 10,
                paddingRight: 10
            }}>
            <Grid container
                direction="row"
                justify="space-between"
                alignItems="center"
            >
                <div style={{ height: 250 - mobileFlag * 100 }} >
                    <IconButton onClick={handleClose} >
                        <i className="material-icons" > close </i>
                    </IconButton >
                </div>
                <img style={{ height: 250 - mobileFlag * 100, maxWidth: width - 120, textAlign: 'center' }}
                    src={`${selItem.Image}`}
                    alt={selItem.Description} />
                <div style={{ width: 48 }} />
            </Grid >
            <Grid container
                direction="row"
                justify="space-between"
                alignItems="center"
            >
                <h3 style={{ marginBlockStart: 0, marginBlockEnd: 0 }}>{selItem.Name} </h3>
                <h4 style={{ marginBlockStart: 0, marginBlockEnd: 0 }}>$ {selItem.Price} </h4>
            </Grid >
            <p style={{ marginBlockStart: 0 }}>Descriptions : {selItem.Description}</p>
            {
                mobileFlag ? null : <RenderItemDetWebFooter />
            }
        </div>)

    const RenderItemModifiers = (props) => (<div style={{ paddingTop: 382 - mobileFlag * 170 }}>
        {
            selItem['Available_modifiers'].map((mod, id) => (
                <div key={id}>
                    <p className="modHeader">{modis[mod].Name}</p>
                    {
                        modis[mod]['Multi_choices'] ?
                            <div style={{ paddingLeft: 20, paddingRight: 20 }}>
                                {
                                    modis[mod].Options.map((opt, ido) =>
                                        <FormControlLabel
                                            key={ido}
                                            style={{ display: 'flex' }}
                                            control={
                                                <Checkbox
                                                    checked={selInfo[mod][opt.Name] ? true : false}
                                                    onChange={event => {
                                                        let info = JSON.parse(JSON.stringify(selInfo));
                                                        info[mod][opt.Name] = event.target.checked;
                                                        setSelInfo(info);
                                                    }}
                                                    value={opt.Name}
                                                    color="primary"
                                                />
                                            }
                                            label={`${opt.Name} Price   + $${opt['Price_offset']}`}
                                        />)
                                }
                            </div> :
                            <RadioGroup aria-label="position" name="position"
                                value={selInfo[mod]}
                                onChange={(event) => {
                                    let info = JSON.parse(JSON.stringify(selInfo));
                                    info[mod] = event.target.value;
                                    setSelInfo(info);
                                }}
                                style={{ paddingLeft: 20 }}>
                                {
                                    modis[mod].Options.map((opt, ido) => <FormControlLabel
                                        value={opt.Name}
                                        key={ido}
                                        control={<Radio color="primary" />}
                                        label={opt.Name}
                                        labelPlacement="end"
                                    />)
                                }
                            </RadioGroup>
                    }
                </div>
            ))
        }
        {
            mobileFlag ? <div style={{ height: 70 }} /> : null
        }
    </div>)


    // Render Item Detail Dialog
    const RenderEditDetDlg = (props) => (<div style={{
        width: Math.min(560, width),
        backgroundColor: 'white'
    }}>
        <RenderItemDetHeader />
        <RenderItemModifiers />
        <RenderEditItemDetFooter />
    </div >)


    // Render Order Item
    const RenderOrderItem = (props) => {
        let infos = [];
        for (let key in props.item.info) {
            if (modis[key]['Multi_choices']) {
                for (let modi in props.item.info[key]) {
                    if (props.item.info[key][modi]) {
                        for (let t in modis[key]['Options']) {
                            if (modis[key]['Options'][t].Name == modi) {
                                infos.push({ name: modi, price: '$' + modis[key]['Options'][t].Price_offset });
                            }
                        }
                    }
                }
            } else {
                infos.push({ name: props.item.info[key], price: '' })
            }
        }
        return <div>
            <div className="FlexView">
                <p style={{ fontWeight: 'bold', fontSize: '18px', marginBlockEnd: 0 }}>{props.item.item.Name}</p>
                <p style={{ fontWeight: 'bold', marginBlockEnd: 0 }}>${props.item.item.Price}</p>
            </div>
            {
                infos.map((info, id) => <div key={id} className="FlexView">
                    <p style={{ marginBlockEnd: 0, marginBlockStart: 0 }}>{info.name}</p>
                    <p style={{ marginBlockEnd: 0, marginBlockStart: 0 }}>{info.price}</p>
                </div>)
            }
            <div className="FlexView">
                <div className="TopButtons">
                    <IconButton onClick={() => {
                        onRemoveOrderItem(props.item, props.id)
                    }} >
                        <i className="material-icons" > remove_circle_outline </i>
                    </IconButton >
                    <p>{`${props.item.count}`}</p>
                    <IconButton onClick={() => {
                        onAddOrderItem(props.item, props.id)
                    }} >
                        <i className="material-icons" > add_circle_outline </i>
                    </IconButton >
                    <p>{`   $${props.item.price} `}</p>
                </div>
                <Button onClick={() => {

                    editId = props.id;
                    price = props.item.item.Price;

                    setSelCount(props.item.count);
                    setSelInfo(props.item.info);
                    setSelItem(props.item.item);
                    setEditDetDlg(true);
                }} color="primary">Edit</Button>
            </div>
        </div>
    }
    {/**
        doneContactInfo ? <div>
        <h3>Contact Info</h3>
        <Grid container
            direction="row"
            space={3}
        >
            <Grid item md={6} xs={12}>
                <div className="TopButtons">
                    <AccountCircle />
                    <p style={{ marginBlockStart: 0, paddingLeft: 20 }}>{name}</p>
                </div>
            </Grid>
            <Grid item md={6} xs={12}>
                <div className="TopButtons">
                    <Phone />
                    <p style={{ marginBlockStart: 0, paddingLeft: 20 }}>{phone}</p>
                </div>
            </Grid>
        </Grid>
        <div className="TopButtons">
            <Email />
            <p style={{ marginBlockStart: 0, paddingLeft: 20 }}>{email}</p>
        </div>
        <Button onClick={() => setDoneContactInfo(false)} color="primary">Edit</Button>
        </div> : 
         */}
    const RenderContactInfo = () => (
        <div>
            <h3>Contact Info</h3>
            <Grid container
                direction="row"
                space={3}
                justify="space-between"
            >
                <Grid item md={5} xs={12}>
                    <TextField
                        id="input-with-icon-textfield"
                        label="Name"
                        fullWidth
                        defaultValue={name}
                        onChange={event => name = event.target.value}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccountCircle />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item md={5} xs={12}>
                    <TextField
                        id="input-with-icon-textfield"
                        label="Phone"
                        fullWidth
                        defaultValue={phone}
                        onChange={event => phone = event.target.value}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Phone />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>
            <TextField
                id="input-with-icon-textfield"
                label="Email"
                fullWidth
                defaultValue={email}
                onChange={event => email = event.target.value}
                style={{ marginTop: 10 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Email />
                        </InputAdornment>
                    ),
                }}
            />
            {/** <Button variant='contained' style={{ marginTop: 10 }} onClick={onContactInfoDone} color="primary">Done</Button> */}
        </div>)

    const RenderTipping = () => (<div>
        <div className="TopButtons">
            <p style={{ fontWeight: 'bold', fontSize: 18 }}>Tipping</p>
            <p style={{ color: '#777', fontSize: 18, marginLeft: 10 }}> (goes to the business)</p>
        </div>

        <div className="TopButtons">
            {business ?
                business['Tips_option'].map((item, id) =>
                    item == tipValue ? <Button key={id} variant="contained" style={{ marginRight: 15 }} color="secondary">{item}%</Button> :
                        <Button key={id} onClick={() => setTipValue(item)} variant="outlined" style={{ marginRight: 15 }} color="primary">{item}%</Button>

                ) : null
            }
        </div>
    </div>)

    useEffect(() => {
        if (!called) {
            return;
        }

    }, [called]);

    if (!business) {
        props.history.push('/');
        return <div></div>;
    }

    if (editDetDlg && mobileFlag) {
        return <RenderEditDetDlg />
    }

    return <LoadingOverlay
        active={loadingOver}
        spinner
        text='Please wait for a moment...'
    >
        <Card className="TopBar TopButtons">
            {
                mobileFlag ? <IconButton onClick={() => { props.history.push('/') }} >
                    <i className="material-icons" > close </i>
                </IconButton > : null
            }
            <p style={{ fontWeight: 'bold', fontSize: 18 }} >Check Out</p>
        </Card>
        <div style={{ height: 70 + (1 - mobileFlag) * 20 }} />
        <div className="App" style={{ paddingLeft: width / 20, paddingRight: width / 20 }} >
            <Grid container
                direction="row"
                justify="space-between"
            >
                <Grid item md={5} sm={12} xs={12}>
                    {
                        mobileFlag ? <div><h3>Items ({orderItems.length})</h3>
                            {
                                orderItems.map((item, id) => <RenderOrderItem item={item} key={id} id={id} />)
                            }</div> : null
                    }
                    <RenderContactInfo />

                    {
                        flagPayment == 'hide' ? <div>
                            <p style={{ fontSize: 18, color: '#aaa' }}>Payment</p>
                            <p style={{ color: '#aaa' }}>Complete your contact info to see payment options.</p>
                        </div> :

                            <div>
                                <h3>Payment</h3>
                                <div className='BorderCSS'>
                                    <RenderCard />
                                </div>
                                {/**
                                                                <Button variant='contained' style={{ marginTop: 10 }} onClick={() => {
                                    if (flagPayment == 'edit') {
                                        onDonePayment();
                                    } else {
                                        setFlagPayment('edit');
                                    }
                                }} color="primary">
                                    {flagPayment == 'edit' ? 'Done' : 'Edit'}</Button>
                                 */}
                            </div>
                    }

                    <RenderTipping />
                    {
                        mobileFlag ? null : <div><h3>Items ({orderItems.length})</h3>
                            {
                                orderItems.map((item, id) => <RenderOrderItem item={item} key={id} id={id} />)
                            }</div>
                    }
                </Grid>
                <Grid item md={5} sm={12} xs={12}>
                    <Card style={{ marginBottom: 20 }}>
                        <div style={{ margin: width / 60 }}>
                            <h3>Order Summary</h3>
                            <div className="TopButtons">
                                <i className="material-icons">alarm</i>
                                {business ? <p style={{ marginBlockStart: 0, marginBlockEnd: 0, paddingLeft: 20 }}>{business.Estimate_time_min - 5}-{business.Estimate_time_min + 5} min Estimated</p> : null}
                            </div>
                            <div className="TopButtons">
                                <FontAwesomeIcon icon={faMapMarkedAlt} size="lg" />
                                <p style={{ marginBlockStart: 0, marginBlockEnd: 0, paddingLeft: 20 }}>{position}</p>
                            </div>
                            <hr />
                            <div className="FlexView">
                                <p style={{ fontSize: 18, marginBlockEnd: 0 }}>Subtotal</p>
                                <p style={{ fontSize: 18, marginBlockEnd: 0 }}>${subtotal.toFixed(2)}</p>
                            </div>
                            <div className="FlexView">
                                <p style={{ fontSize: 18, marginBlockEnd: 0 }}>Tax</p>
                                <p style={{ fontSize: 18, marginBlockEnd: 0 }}>${tax.toFixed(2)}</p>
                            </div>
                            <div className="FlexView">
                                <p style={{ fontSize: 18, marginBlockEnd: 0 }}>Tips</p>
                                <p style={{ fontSize: 18, marginBlockEnd: 0 }}>${tip.toFixed(2)}</p>
                            </div>
                            {type === 'ONLINE_DELIVERY' &&
                                <div className="FlexView">
                                    <p style={{ fontSize: 18, marginBlockEnd: 0 }}>Delivery Fee</p>
                                    <p style={{ fontSize: 18, marginBlockEnd: 0 }}>$4.00</p>
                                </div>
                            }
                            <div className="FlexView">
                                <p style={{ fontSize: 18, fontWeight: 'bold', marginBlockEnd: 0 }}>Total</p>
                                <p style={{ fontSize: 18, fontWeight: 'bold', marginBlockEnd: 0 }}>${total.toFixed(2)}</p>
                            </div>
                            {/** doneContactInfo == false || flagPayment != 'show'*/}
                            {(name == '' || phone == '' || email == '') && <div>
                                <p style={{ color: '#f33' }}>Please complete your information</p>
                                <Button variant='contained' color="primary" onClick={() => onPlaceOrder(props)}>Place Order</Button>
                            </div>}
                            {
                                !(name == '' || phone == '' || email == '') && tipValue == -1 && <div>
                                    <p style={{ color: '#f33' }}>Please choose a tipping rate</p>
                                    <Button variant='contained' color="primary" onClick={() => onPlaceOrder(props)}>Place Order</Button>
                                </div>
                            }
                            {
                                !(name == '' || phone == '' || email == '') && tipValue !== -1 &&
                                <Button onClick={() => onPlaceOrder(props)} style={{ marginTop: 20 }} variant="contained" color="primary">Place Order</Button>
                            }
                        </div>
                    </Card>
                    {
                        business ? <div style={{ height: 400 }}>
                            <GoogleMapReact
                                bootstrapURLKeys={
                                    { key: "AIzaSyC0aU-FNMFL1hXT9hgbzSDN4824qvy7fxk" }
                                }
                                defaultCenter={
                                    {
                                        lat: business['_geoloc'].lat,
                                        lng: business['_geoloc'].lng
                                    }
                                }
                                defaultZoom={15} >
                                <AnyReactComponent
                                    lat={business['_geoloc'].lat}
                                    lng={business['_geoloc'].lng}
                                    text="Hello Jasmine" />
                            </GoogleMapReact></div> : null
                    }

                </Grid>
            </Grid>
        </div>
        <FooterBar />
        {
            selItem ?
                <Dialog open={editDetDlg}
                    onClose={(handleClose)}
                    aria-labelledby="form-dialog-title" >
                    <RenderEditDetDlg />
                </Dialog> : null
        }
    </LoadingOverlay >
}

export default injectStripe(withFirebase(Checkout));