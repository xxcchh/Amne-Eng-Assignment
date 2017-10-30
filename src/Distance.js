import React, { Component } from 'react'
import { compose, withProps } from 'recompose'
import { GoogleMap, Marker, withGoogleMap, withScriptjs } from 'react-google-maps'
import './Distance.css'

const fetch = require("isomorphic-fetch");


/*
* Result class
* */
class result {
 constructor (id, address, estateName, number, addrA, addrB){
   this.id = id;
   this.address = address;
   this.name = estateName
   this.num = number
   this.distanceA = addrA
   this.distanceB = addrB
   this.sum = (Number(addrA) + Number(addrB)).toPrecision(5);
 }
}

/*Geo class
* */
class geodata {
  constructor (id, addr, lat, lgn, miniaddr){
    this.id = id
    this.addr = addr
    this.lat = lat
    this.lng = lgn
    this.miniaddr = miniaddr
  }
}

/*
* Function to show alert messages
* */
const ShowAlert = (props) => {
  if (props.alert === -1){
    return <div className="alert alert-danger" align="center">
      Please input both addresses correctly!
    </div>
  }else if (props.alert === 0){
    return <div className="alert alert-success" align="center">
      The result is successfully found!
    </div>
  }else if (props.alert === 2){
    return <div className="alert alert-dark" align="center">
      Can not find the address in Austin, TX using Google Map!
    </div>
  }
  return <div className="alert alert-primary" align="center">Please input two addresses! </div>
}


/*
* Main function for the web app
* */
class Distance extends Component{

  constructor (props){
    super(props);
    this.getGeo = this.getGeo.bind(this);
    this.getResponse = this.getResponse.bind(this);
    this.resetAddr = this.resetAddr.bind(this);
    this.getList = this.getList.bind(this);
    this.calculateAddr = this.calculateAddr.bind(this);
    Distance.getResult = Distance.getResult.bind(this);
    this.state = {
      addrA: undefined,
      addrB: undefined,
      res: [],
      alert: 1,
    };
  }

  // Reset address
  resetAddr(){
    this.setState(() => {
      return {
        addrA: undefined,
        addrB: undefined,
        res: [],
      }
    });
  }

  // Prune input address
  static pruneAddr(s){
    let exp = /[\/\\^$*+?()|[\]{}]/g;
    if (exp.test(s)){
      return undefined;
    }
    let sNew = s.split(" ").join("+");
    return sNew;
  }

  // To Radius
  static toRad(x){
    return x * Math.PI / 180;
  }

  // Get the distance
  static getDistance(geoA, geoB){
    let lat1 = geoA.lat, lat2 = geoB.lat, lng1 = geoA.lng, lng2 = geoB.lng;
    let earthRadius = 3958.75;
    let dLat = Distance.toRad(lat2-lat1);
    let dLng = Distance.toRad(lng2-lng1);
    let sindLat = Math.sin(dLat / 2);
    let sindLng = Math.sin(dLng / 2);
    let a = Math.pow(sindLat, 2) + Math.pow(sindLng, 2)
      * Math.cos(Distance.toRad(lat1)) * Math.cos(Distance.toRad(lat2));
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let dist = earthRadius * c / 1.60934 ;
    return dist.toPrecision(5);
  }

  // Sort the array by distance
  static sortRes(arr){
    return arr.sort(function (a, b) {
      let x = a.sum;
      let y = b.sum;
      x = Number(x);
      y = Number(y);
      return ((x < y)? -1: ((x > y)? 1: 0));
    })
  }

  // Get result
  static getResult(geoTemp, idx, geoA, geoB){
    return new result(geoTemp.id, geoTemp.addr, geoTemp.miniaddr, idx,
            Distance.getDistance(geoTemp, geoA), Distance.getDistance(geoTemp, geoB));
  }

  // Get response from google map
  getResponse(url){
    let res;
    let defaultAddr = "Austin, TX, USA";
    res = fetch(url).then(res => res.json()).then(data => {
      if (data.status === "OK" && data.results.length > 0 &&
                data.results[0].formatted_address !== defaultAddr){
        let loc =  data.results[0].geometry.location;
        let id = data.results[0].place_id;
        let address = data.results[0].formatted_address;
       return new geodata(id, address, loc.lat, loc.lng, address);
      }
    });
    return res;
  }

  // Get geo location of the input data
  getGeo(A, B){
    let url = "https://maps.googleapis.com/maps/api/geocode/json?" +
      "components=country:US|administrative_area:TX|locality:Austin" +
      "&key=AIzaSyBLmRww05E9gjXov0_hkfFw74vfYoKFLuM&address=";
    let addrA = Distance.pruneAddr(A);
    let addrB = Distance.pruneAddr(B);
    if (addrA === undefined || addrB === undefined){
      return {"valid": false, "geoA": undefined, "geoB": undefined};
    }
    let urlA = url.concat(addrA);
    let urlB = url.concat(addrB);
    let geoA = this.getResponse(urlA);
    let geoB = this.getResponse(urlB);
    return {"valid": true, "geoA": geoA, "geoB": geoB};
  }

  // Get the list of places within 10 miles of each address
  getList(geo){
    let url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDdXsj6AEHfUZDCxcmCzIW9r_7AuR5kG2g" +
      "&type=real_estate_agency&radius=16093.4&location=";
    let lat = geo.lat;
    let lng = geo.lng;
    let requestURL = url + lat + "," + lng;
    let proxyURL = "https://young-headland-85340.herokuapp.com/";
    let tmpURL = proxyURL + requestURL;
    return fetch(tmpURL)
      .then(res => res.json())
      .then(data => {
      if (data.results.length > 0 && data.status === "OK") {
        let tmp = data.results;
        return tmp.map((t) => {
          return new geodata(t.place_id, t.vicinity,
                    t.geometry.location.lat, t.geometry.location.lng, t.name);
        });
      }
    });
  }

  // Calculate to get the nearest places
  calculateAddr(e) {
    e.preventDefault();
    this.resetAddr();

    let addrARaw = e.target.elements.addrA.value.trim();
    let addrBRaw = e.target.elements.addrB.value.trim();
    if (addrARaw === "" || addrBRaw === ""){
        this.setState(() => {
          return {
            alert: -1
          };
        });
        this.resetAddr();
    }else{
      let res = this.getGeo(addrARaw, addrBRaw);
      if (res.valid){
        let geoRes = Promise.all([res.geoA, res.geoB]);
        geoRes.then((arr) => {
            let geoARes = arr[0] === undefined? undefined: this.getList(arr[0]);
            let geoBRes = arr[1] === undefined? undefined: this.getList(arr[1]);
            let geoList = Promise.all([geoARes, geoBRes]);
            geoList.then((g) => {
              if (g[0] === undefined ||
                      g[1] === undefined){
                this.setState(() => {
                  return {
                    alert: 2
                  }
                });
              }else{
                g[0].forEach((v) => {
                  let tmp = Distance.getResult(v, this.state.res.length, arr[0], arr[1]);
                  this.setState((prev) => {
                    return {
                      res: prev.res.concat(tmp),
                    }
                  })
                })
                g[1].forEach((v) => {
                  let tmp = Distance.getResult(v, this.state.res.length, arr[0], arr[1]);
                  this.setState((prev) => {
                    return {
                      res: prev.res.concat(tmp),
                  }})
                })
              }
            }).then(() => {
              let finalRes = [];
              let idRes = [];
              this.state.res.forEach((e, v) => {
                if (idRes.indexOf(e.id) < 0){
                  idRes.push(e.id);
                  finalRes.push(e);
                }
              })
              this.setState(() => {
                return {
                  res: Distance.sortRes(finalRes),
                  alert: 0
                };
              });
            })
        });
      }else{
        this.setState(() => {
          return {
            alert: -1
          };
        });
        this.resetAddr();
      }
    }
  };

  render(){
    return (
      <div className="container-fluid function">
        <div className="row">
          <div className="col-md-12">
            <ShowAlert alert={this.state.alert}/>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <h3>Panel</h3>
            <AddForm
              calculateAddr={this.calculateAddr}
              getGeo={this.getGeo}
            />
            <div id="MyMap">
              <MyMapComponent />
            </div>
          </div>
          <div className="col-md-6">
            <h3>Result <span className="badge badge-secondary">
                    {this.state.res.length}</span> </h3>
            <GetResult
              res={this.state.res}
            />
          </div>
        </div>
      </div>
    );
  }

}

/*
* Google Map to use
* */
const GoogleMapComponent = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyCDZeqFRYtHY5YdQsXwdK2HUKtXS_SzwLg" +
                  "&libraries=geometry,drawing,places",
    loadingElement: <div style={{height: `100%`}}/>,
    containerElement: <div style={{width: `725px`, height: `500px`}}/>,
    mapElement: <div style={{height: `100%`}}/>
  }),
  withScriptjs,
  withGoogleMap
)((props) =>
  <GoogleMap
    defaultZoom={15}
    defaultCenter={{lat: 30.307182, lng: -97.755996}}>

    {props.isMarkerShown && <Marker position={{lat: 30.307182, lng: -97.755996}}/>}

  </GoogleMap>
)

/*
* My Google Map components
* */
class MyMapComponent extends React.Component {

  state = {
    isMarkerShown: false,
  }

  componentDidMount() {
    this.delayedShowMarker()
  }

  delayedShowMarker = () => {
    setTimeout(() => {
      this.setState({ isMarkerShown: true })
    }, 500)
  }

  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false })
    this.delayedShowMarker()
  }

  render() {
    return (
      <GoogleMapComponent
        isMarkerShown={this.state.isMarkerShown}/>
    )
  }

}


/*Address form to use
* */
class AddForm extends Component{
  render() {
        return (<form className="form-inline" onSubmit={this.props.calculateAddr}>
          <span className="badge badge-pill badge-success">A</span>
          <div className="form-group col-md-4">
            <label className="sr-only">Address of A</label>
            <input type="text" className="form-control" placeholder="Address of A" name="addrA"/>
          </div>
          <span className="badge badge-pill badge-danger">B</span>
          <div className="form-group col-md-4">
            <label className="sr-only">Address of B</label>
            <input type="text" className="form-control" placeholder="Address of B" name="addrB"/>
          </div>
          <button type="submit" className="btn btn-outline-primary">Confirm</button>
        </form>);
  }
}

/*
* Result table to use
* */
class GetResult extends Component{
  render() {
      return ( <table className="table table-striped table-bordered"
                          cellSpacing="0" width="100%">
      <thead>
      <tr>
        <th>Name</th>
        <th>Address</th>
        <th>Distance From A</th>
        <th>Distance From B</th>
        <th>Sum Of Distance</th>
      </tr>
      </thead>
      <tbody>
      {this.props.res.length > 0 && (this.props.res.map((p) =>{
        return (
          <tr key={p.num}>
            <td>{p.name}</td>
            <td>{p.address}</td>
            <td>{p.distanceA}</td>
            <td>{p.distanceB}</td>
            <td>{p.sum}</td>
          </tr>
        )
      }))}
      </tbody>
    </table>
  );
  }
}


export default Distance;



