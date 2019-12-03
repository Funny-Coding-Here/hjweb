import React, { useEffect, useState } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import SvgIcon from '@material-ui/core/SvgIcon';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Drawer from '@material-ui/core/Drawer';
import { withFirebase } from './Firebase';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import hlp from './helper';
import Radio from '@material-ui/core/Radio';
import Checkbox from '@material-ui/core/Checkbox';
import { useAlert } from 'react-alert';
import TextField from '@material-ui/core/TextField';

import Logo from './View/Logo';
import DeliverDetDlg from './View/DeliverDetDlg';
import FooterBar from './View/FooterBar';

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
        fontSize: 16,
        color: '#000',
        fontWeight: "normal"
    },
    input: {
        display: 'none',
    },
    chooseTypeContainer: {
        paddingTop: '10%',
        paddingBottom: '5%',
    },
    chooseType: {
        marginTop: '5%',
    },
    navButton: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        fontWeight: "normal",
    }
}));


TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};


function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
        style: { color: '#696969' }
    };
}


function HomeIcon(props) {
    return (<SvgIcon {...props} >
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z" />
    </SvgIcon>
    );
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (<Typography component="div"
        role="tabpanel"
        hidden={value !== index}
        id={`scrollable-auto-tabpanel-${index}`}
        aria-labelledby={`scrollable-auto-tab-${index}`} {...other} >
        <Box p={3} > {children} </Box> </Typography >
    );
}

var editId = 0;

function App(props) {
    const alert = useAlert();
    const { height, width } = hlp.useWindowDimensions();
    const classes = useStyles();
    const [business, setBusiness] = useState(null);
    const [cates, setCates] = useState(null);
    const [called, setCalled] = useState(1);
    const [value, setValue] = useState(0);
    const [items, setItems] = useState(null);
    const [tabState, setTabState] = useState('pickup');
    const [itemDetDlg, setItemDetDlg] = useState(false);
    const [editDetDlg, setEditDetDlg] = useState(false);
    const [deliverDetDlg, setDeliverDetDlg] = useState(false);
    const [deliverStatus, setDeliverStatus] = useState(0);
    const [position, setPosition] = useState('');
    const [selItem, setSelItem] = useState(null);
    const [selCount, setSelCount] = useState(1);
    const [selInfo, setSelInfo] = useState({});
    const [modis, setModis] = useState(null);
    const [ordersDrawer, setOrdersDrawer] = useState(false);
    //page can be the 0:choose deli or pick up, 1: input addr page, 2:show out of range page, 3: to item page
    const [choosePage, setChoosePage] = useState(0);

    let orderItems = props.firebase.getOrders();
    let price = 0;
    let mobileFlag = 0;
    if (width < 500) {
        mobileFlag = 1;
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

    const onRemoveOrderItem = (item, id) => {
        if (item.count < 2) {
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
        item.price += getToppings(item.info)
        setCalled(called + 1);
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

    const onAddOneOrder = () => {
        handleClose();
        price = 0;
        calculatePrice();
        let item = {
            item: selItem,
            count: selCount,
            info: selInfo,
            price: price
        }
        props.firebase.addOneOrder(item);
    }

    const handleClose = () => {
        setItemDetDlg(false);
        setDeliverDetDlg(false);
        setOrdersDrawer(false);
        setEditDetDlg(false);
    };

    const onBtnCheckout = () => {
        if (props.firebase.getPosition() == '' && tabState === 'delivery') {
            alert.show('Please Select Position First!');
            return;
        }
        if (orderItems.length == 0) {
            alert.show('Please add Items First!');
            return;
        }
        props.firebase.updateType(tabState == 'delivery' ? "ONLINE_DELIVERY" : "ONLINE_PICKUP");
        props.history.push('/checkout');
    }

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

    if (selItem) {
        calculatePrice();
    }

    const handleOpen = (item) => {
        let info = {};
        item['Available_modifiers'].forEach((mod) => {
            if (modis[mod]['Multi_choices'] == false) {
                info[mod] = modis[mod].Options[0].Name;
            } else {
                info[mod] = {};
            }
        })
        setSelCount(1);
        price = item.Price;
        setSelInfo(info);
        setSelItem(item);
        if (tabState == 'pickup') {
            setItemDetDlg(true);
        } else {
            {/**
            setPosition('');
            setDeliverDetDlg(true);
            setDeliverStatus(0);
            setTabState('delivery');
             */}
            setItemDetDlg(true);
        }
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // console.log("----------------------------------------00000000000000-",business)
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
        return <div style={{ padding: 20 }}>
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
                    <IconButton onClick={() => onRemoveOrderItem(props.item, props.id)} >
                        <i className="material-icons" > remove_circle_outline </i>
                    </IconButton >
                    <p>{`${props.item.count}`}</p>
                    <IconButton onClick={() => onAddOrderItem(props.item, props.id)} >
                        <i className="material-icons" > add_circle_outline </i>
                    </IconButton >
                    <p>{`   $${props.item.price} `}</p>
                </div>
                <Button onClick={() => {
                    setOrdersDrawer(false);
                    editId = props.id;

                    console.log('HERE SEE!');
                    console.log(props.item);
                    setSelCount(props.item.count);
                    price = props.item.item.Price;
                    setSelInfo(props.item.info);
                    setSelItem(props.item.item);

                    setEditDetDlg(true);
                }} color="primary">Edit</Button>
            </div>
        </div>
    }

    // Top Bar Render
    const RenderTopBar = (props) => (<div className="TopBar" >
        <Grid container direction="row"
            justify="space-between"
            alignItems="center" > {
                tabState == 'pickup' ?
                    <div className="TopButtons" >
                        <Button fullWidth className={classes.navButton} onClick={() => {
                            // setTabState('delivery');
                            // setChoosePage(1);
                            window.location.assign('https://www.ubereats.com/en-US/chicago/food-delivery/hello-jasmine/JnCl5_dnTQatU1lwEWUewg/')                        }} color="inherit" variant="contained" >DELIVERY</Button>
                        <Grid item xs={1} />
                        <Button fullWidth className={classes.navButton} color="primary" variant="contained">PICK UP</Button>
                    </div > :
                    <div className="TopButtons" >
                        <Button fullWidth size="small" className={classes.navButton} onClick={props.onClick}>{props.position}</Button>
                        <Button fullWidth className={classes.navButton} color="primary" variant="contained">DELIVERY</Button>
                        <Grid item xs={1} />
                        <Button fullWidth className={classes.navButton} onClick={() => { setTabState('pickup'); setPosition(''); }} color="inherit" variant="contained">PICK UP</Button>
                    </div >
            }
            <div className="TopButtons">
                {/* <Button className={classes.button} >中文</Button>*/}
                <IconButton onClick={() => setOrdersDrawer(true)} >
                    <HomeIcon className={classes.icon} />
                </IconButton >
                {
                    orderItems.length > 0 ? <p>{orderItems.length}</p> : null
                }
            </div>
        </Grid>
    </div >)

    // Tab Bar Render
    const RenderTabBar = () => (<div style={{
        paddingLeft: width / 20 * (1 - mobileFlag),
        paddingRight: width / 20 * (1 - mobileFlag)
    }}>
        <AppBar position="static"
            color="default" style={{ marginTop: width / 50 * (1 - mobileFlag) }} >
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                style={{ background: '#FFF' }}
                label="scrollable auto tabs example" > {
                    cates.map((cate, id) =>
                        <Tab key={id} label={cate.Category} {...a11yProps(id)} />
                    )
                }
            </Tabs>
        </AppBar >
    </div>)

    const RenderCard = (props) => (
        <Card>
            <CardActionArea >
                <Grid container direction="row"
                    alignItems="center"
                    justify="space-between"
                    space={1}
                    style={{ padding: width / 100, paddingLeft: width / 40 }} >
                    <Grid item md={5} xs={5} style={{ textAlign: 'center' }} >
                        <CardMedia style={{ height: 140, width: width / 3, maxWidth: 120 }}
                            image={props.item.Image}
                            title={props.item.Description}
                        />
                    </Grid >
                    <Grid item md={7}
                        xs={7} >
                        <CardContent style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }} >
                            <Typography gutterBottom variant="h6" component="h3" style={{ textAlign: 'left' }} > {props.item.Name} </Typography>
                            <Typography variant="body2" color="textSecondary"
                                component="p"
                                style={{ textAlign: 'right', fontSize: 18, fontWeight: 'bold' }} > $ {props.item.Price} </Typography>
                        </CardContent >
                    </Grid>
                </Grid >
            </CardActionArea>
        </Card>)

    // Render Card Grid
    const RenderCardGrid = (props) => (<Grid container spacing={3}
        style={{
            paddingTop: 30,
            paddingLeft: width / 20,
            paddingRight: width / 20,
        }} > {items.map((item, id) =>
            item.Category == cates[value].Category ?
                < Grid key={id}
                    item lg={4}
                    md={4}
                    sm={6}
                    xs={12} >
                    <Card onClick={() => handleOpen(item)} >
                        <RenderCard item={item} /></Card>
                </Grid> : null)
        }
    </Grid>)

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
                <img style={{ height: 250 - mobileFlag * 100, maxWidth: width - 120, textAlign: 'center', marginTop:20, marginBottom:20 }}
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
            <RenderItemDetWebFooter />
        </div>)

    const RenderItemModifiers = (props) => (<div style={{ paddingTop: 382 - mobileFlag * 100 }}>
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
    </div>)

    const RenderItemDetWebFooter = () => (<div>
        {
            editDetDlg ? < DialogActions style={{ backgroundColor: 'white' }
            }>
                <Button variant='contained' onClick={onUpdateOrder} color="primary">Update Order</Button>
            </DialogActions > : < DialogActions style={{ backgroundColor: 'white' }
            }>
                    <Grid container
                        direction="row"
                        justify="space-between"
                        space={10}
                    >
                        <div className="TopButtons">
                            <IconButton onClick={() => selCount > 1 ? setSelCount(selCount - 1) : null} >
                                <i className="material-icons" > remove_circle_outline </i>
                            </IconButton >
                            <p>{`${selCount}`}</p>
                            <IconButton onClick={() => setSelCount(selCount + 1)} >
                                <i className="material-icons" > add_circle_outline </i>
                            </IconButton >
                            <p>{`   $${price} `}</p>
                        </div>
                        <Button variant='contained' onClick={onAddOneOrder} color="primary">Add to Order</Button>
                    </Grid>
                </DialogActions >
        }</div>)

    // Render Item Detail Dialog
    const RenderItemDetDlg = (props) => (<div style={{
        width: Math.min(560, width),
        backgroundColor: 'white'
    }}>
        <RenderItemDetHeader />
        <RenderItemModifiers />
    </div >)

    // Render Item Detail Dialog
    const RenderEditDetDlg = (props) => (<div style={{
        width: Math.min(560, width),
        backgroundColor: 'white'
    }}>
        <RenderItemDetHeader />
        <RenderItemModifiers />
    </div >)

    const RenderDrawer = () => (
        <div style={{
            width: Math.min(500, width - 20),
            paddingLeft: 10,
            paddingRight: 10
        }}>
            <div className="DrawerTop">
                <IconButton onClick={handleClose} >
                    <i className="material-icons" > close </i>
                </IconButton >
                <p>Your Order ({orderItems.length})</p>
                <div style={{ width: 48 }} />
            </div>
            {
                orderItems.map((item, id) => <div key={id}>
                    <RenderOrderItem item={item} id={id} />
                </div>)
            }
            <Button fullWidth variant="contained" onClick={onBtnCheckout} color="primary">Next: Checkout</Button>
        </div >
    )


    const RenderOutOfRange = (props) => {
        return (
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Grid item xs={12}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item xs={8}>
                            <Typography variant="h5">Outside of delivery range.</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item xs={8}>
                            <Grid
                                container
                                direction="row"
                                justify="center"
                                alignItems="center"
                            >
                                <TextField
                                    id="outlined-search"
                                    label="Address"
                                    type="search"
                                    fullWidth={true}
                                    margin="normal"
                                    variant="outlined"
                                    value={position}
                                    disabled
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )

    }

    const RenderAddrInput = (props) => {
        return (
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Grid item xs={12}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item xs={8}>
                            <Typography variant="h5">Does this restaurant deliver to you?</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant="subtitle1">Before starting your order, tell us your address</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item xs={8}>
                            <Grid
                                container
                                direction="row"
                                justify="center"
                                alignItems="center"
                            >
                                <TextField
                                    id="outlined-search"
                                    label="Address"
                                    type="search"
                                    fullWidth={true}
                                    margin="normal"
                                    variant="outlined"
                                    onChange={props.onChange}
                                    value={position}
                                    autoFocus={true}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }
    const RenderChooseButton = (props) => {
        const leftText = props.left;
        const rightText = props.right;
        const leftOnClick = props.leftOnClick;
        const rightOnClick = props.rightOnClick;
        return (
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Grid item xs={12} sm={3} className={classes.chooseType}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                    >
                        <Button
                            onClick={leftOnClick}
                            variant="contained"
                            color={props.leftColor}
                        >
                            <Typography variant="h6">{leftText}</Typography>
                        </Button>
                    </Grid>

                </Grid>
                <Grid item xs={12} sm={3} className={classes.chooseType}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                    >
                        <Button
                            onClick={rightOnClick}
                            variant="contained"
                            color="primary"
                        >
                            <Typography variant="h6">{rightText}</Typography>
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        )
    }



    const RenderChoosePage = (props) => {
        const windowh = props.height;
        return (
            <div style={{ height: windowh }}>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    className={classes.chooseTypeContainer}
                >
                    <Grid item xs={12} sm={12}>
                        <Typography variant="h3" align="center">Welcome to Hello Jasmine</Typography>
                    </Grid>
                </Grid>
                {choosePage === 0 && <RenderChooseButton
                    left="delivery"
                    right="pick up"
                    leftOnClick={() => { 
                        // setChoosePage(1) 
                        window.location.assign('https://www.ubereats.com/en-US/chicago/food-delivery/hello-jasmine/JnCl5_dnTQatU1lwEWUewg/')
                    }}
                    rightOnClick={() => {
                        setTabState('pickup');
                        setChoosePage(3);
                    }}
                    leftColor="primary"
                />}
                {choosePage === 1 && <RenderAddrInput onChange={(event) => { setPosition(event.target.value) }}></RenderAddrInput>}
                {choosePage === 1 && <RenderChooseButton leftColor="inherit" left="Back" right="Continue" leftOnClick={() => { setChoosePage(0) }} rightOnClick={async () => {
                    const res = await props.getLatLong(position);
                    if (res === 2) {
                        //inner the range, move to the item page and set tabstatus to delivery
                        setTabState('delivery');
                        setChoosePage(3);
                    } else if (res === 1) {
                        //out of range, move to page 2
                        setChoosePage(2);
                    } else {
                        //move to page 0, set tab to picup
                        setTabState('pickup');
                        setChoosePage(0);
                    }
                }} />}
                {choosePage === 2 && <RenderOutOfRange></RenderOutOfRange>}
                {choosePage === 2 && <RenderChooseButton leftColor="inherit" left="Back" right="Switch to pickup" leftOnClick={() => { setChoosePage(1) }} rightOnClick={() => {
                    setTabState('pickup');
                    setChoosePage(3);
                }}></RenderChooseButton>}
                <Grid item style={{ marginBottom: "10%" }}></Grid>
                <FooterBar type="choose" />
            </div>)
    }
    

    useEffect(() => {
        if (called > 1) {
            return;
        }
        props.firebase.login().then(() => {
            props.firebase.getBusiness().then((doc) => {
                // console.log("-=------------------------------------",doc);
                setBusiness(doc);
            });
            props.firebase.getCatalogs().then((cates) => {
                console.log(cates);
                setCates(cates);
            });
            props.firebase.getItems().then((itms) => {
                console.log(itms);
                setItems(itms);
            });

            props.firebase.getModifiers().then((mods) => {
                console.log(mods);
                setModis(mods);
            })
        });
    }, [called]);

    console.log('----- Render Called Checker -----');

    if (choosePage <= 2) return <RenderChoosePage height={height} page={choosePage} getLatLong={props.firebase.getLatLong}></RenderChoosePage>

    if (itemDetDlg && mobileFlag) {
        return <RenderItemDetDlg />
    }
    if (editDetDlg && mobileFlag) {
        return <RenderEditDetDlg />
    }
    if (deliverDetDlg && mobileFlag) {
        return <DeliverDetDlg mobileFlag={mobileFlag} handleClose={handleClose} getLatLong={props.firebase.getLatLong} />
    }
    if (ordersDrawer && mobileFlag) {
        return <RenderDrawer />
    }
    
    return (<div>
        <RenderTopBar position={position} onClick={() => {
            setChoosePage(1);
        }} />
        <div style={{ height: 63 }} />
        {
            business ? // If Business information has fetched
                <Logo business={business} /> : null
        }
        {
            cates && items ?
                <div>
                    <RenderTabBar />
                    <RenderCardGrid />
                </div > : null
        }
        <FooterBar />
        {
            selItem ?
                <div>
                    <Dialog open={itemDetDlg}
                        onClose={handleClose}
                        aria-labelledby="form-dialog-title" >
                        <RenderItemDetDlg />
                    </Dialog>
                    <Dialog open={deliverDetDlg}
                        onClose={handleClose}
                        contentStyle={{ width: 400 }}
                        aria-labelledby="form-dialog-title" >
                        <DeliverDetDlg mobileFlag={mobileFlag} handleClose={handleClose} getLatLong={props.firebase.getLatLong} />
                    </Dialog>
                    <Dialog open={editDetDlg}
                        onClose={handleClose}
                        aria-labelledby="form-dialog-title" >
                        <RenderEditDetDlg />
                    </Dialog>
                </div> : null
        }
        <Drawer anchor="right" open={ordersDrawer} onClose={handleClose}>
            <RenderDrawer />
        </Drawer>
    </div >
    );
}

export default withFirebase(App);