import firebase from 'firebase';
import app from 'firebase/app';
import 'firebase/firestore';
import Geocode from "react-geocode";
require('firebase/auth');
// Firebase Key for contract 
/* 
var firebaseConfig = {
    apiKey: "AIzaSyC0aU-FNMFL1hXT9hgbzSDN4824qvy7fxk",
    authDomain: "contractdemo-383f4.firebaseapp.com",
    databaseURL: "https://contractdemo-383f4.firebaseio.com",
    projectId: "contractdemo-383f4",
    storageBucket: "contractdemo-383f4.appspot.com",
    messagingSenderId: "953406513713",
    appId: "1:953406513713:web:741b96b64afc8820212b10"
};
*/
/** firebase key for test server
 * var firebaseConfig = {
    apiKey: "AIzaSyCrtBezPFvewrrg5WQxdtF0oC8DDztydSg",
    authDomain: "infishare-client-test.firebaseapp.com",
    databaseURL: "https://infishare-client-test.firebaseio.com",
    projectId: "infishare-client-test",
    storageBucket: "infishare-client-test.appspot.com",
    messagingSenderId: "480429663469",
    appId: "1:480429663469:web:11585fdf02ffd058"
};
 */


const firebaseConfig = {
  apiKey: "AIzaSyBqHgJC7GSsGkioSrP3FPgnXzzhmKUqSoI",
  authDomain: "infishare-client.firebaseapp.com",
  databaseURL: "https://infishare-client.firebaseio.com",
  projectId: "infishare-client",
  storageBucket: "infishare-client.appspot.com",
  messagingSenderId: "136269579986",
  appId: "1:136269579986:web:36398616dbb3bcc1e74f0b"
};

// set Google Maps Geocoding API for purposes of quota management. Its optional but recommended.
Geocode.setApiKey("AIzaSyC0aU-FNMFL1hXT9hgbzSDN4824qvy7fxk");

// set response language. Defaults to english.
Geocode.setLanguage("en");

// set response region. Its optional.
// A Geocoding request with region=es (Spain) will return the Spanish city.
Geocode.setRegion("es");

// Enable or disable logs. Its optional.
Geocode.enableDebug();

class Firebase {
    constructor() {
        // Initialize Firebase
        console.log("Initialized Firebase!");
        app.initializeApp(firebaseConfig);

        this.db = app.firestore();
        this.orders = [];
        this.business = null;
        this.position = "";
        this.modis = [];
        this.name = '';
        this.businessId = '64v8lTsT0OZ4cakE19punhwiLVH3';
        //this.businessId = '3cC58AWAdVWDVMm07SoLAMCk9Fg1';
        this.result = {};
        this.user = {};
        this.type = "";
    }


    updateType = (type) => {
        this.type = type;
    } 

    addOneOrder = (order) => {
        this.orders.push(order);
    }

    updateOneOrder = (order, id) => {
        this.orders[id] = order;
    }

    setName = (pName) => {
        this.name = pName;
    }

    setResult = (res) => {
        this.result = res;
    }

    getType = () => {
        return this.type;
    }

    getResult = () => {
        return this.result;
    }

    getOrders = () => {
        return this.orders;
    }

    login = () => {
        return app.auth().signInWithEmailAndPassword("anonymous@gmail.com", "purchasetest").then(() => {
            console.log("user login!");
        });
    }

    getIdToken = () => {
        return app.auth().currentUser.getIdToken();
    }

    getBusiness = () => {
        return this.db.collection('Business').doc(this.businessId).get().then((data) => {
            this.business = data.data();
            return this.business;
        });
    }

    getCatalogs = () => {
        return this.db.collection('Business_catalogs').doc(this.businessId).get().then((data) => {
            return data.data().Categories;
        });
    }

    getItems = () => {
        return this.db.collection('Business_catalogs').doc(this.businessId).collection('Items').get().then((data) => {
            let items = [];
            data.forEach((item) => {
                const tmp = item.data();
                tmp['id'] = item.id;
                items.push(tmp);
            })
            return items;
        })
    }

    getModifiers = () => {
        return this.db.collection('Business_catalogs').doc(this.businessId).collection('Modifiers').get().then((data) => {
            let mods = [];
            data.forEach((item) => {
                mods[item.id] = item.data();
            });
            this.modis = mods;
            return mods;
        })
    }

    getPosition = () => {
        return this.position;
    }

    deg2rad = (deg) => {
        return (deg * Math.PI / 180.0);
    }

    rad2deg = (rad) => {
        return (rad * 180.0 / Math.PI);
    }

    distance = (lat1, lon1, lat2, lon2) => {
        let theta = lon1 - lon2;
        let dist = Math.sin(this.deg2rad(lat1)) * Math.sin(this.deg2rad(lat2)) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.cos(this.deg2rad(theta));
        dist = Math.acos(dist);
        dist = this.rad2deg(dist);
        dist = dist * 60 * 1.1515;
        return dist;
    }

    getLatLong = (pos) => {
        // Get latidude & longitude from address.
        return Geocode.fromAddress(pos).then(
            async (response) => {
                const { lat, lng } = response.results[0].geometry.location;
                const bus = await this.getBusiness();
                const dist = this.distance(lat, lng, bus['_geoloc'].lat, bus['_geoloc'].lng);
                if (dist <= 4) {
                    this.position = pos;
                    return 2;
                }
                this.position = "";
                return 1;
            },
            error => {
                this.position = "";
                console.error(error);
                return 0;
            }
        );
    }

    icon = () => {
        console.log(this.business);
    }
}

export default Firebase;