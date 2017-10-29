import React, {Component} from 'react';
import {compose, withProps} from 'recompose'
import {withScriptjs, withGoogleMap, GoogleMap, Marker} from 'react-google-maps';
import {MarkerClusterer} from 'react-google-maps/lib/components/addons/MarkerClusterer';
import './Distance.css';
const fetch = require("isomorphic-fetch");

/*
* Result class
* */
class result {
 constructor (estateName, number, addrA, addrB){
   this.name = estateName
   this.num = number
   this.distanceA = addrA
   this.distanceB = addrB
 }
}

/*
* History class
* */
class history extends result{
  constructor (estateName, distanceA, distanceB, addrA, addrB){
    super(estateName, 1, distanceA, distanceB);
    this.addrA = addrA;
    this.addrB = addrB;
  }
}

/*Geo class
* */
class geodata {
  constructor (id, addr, lat, lgn, miniaddr){
    this.id = id
    this.addr = addr
    this.lat = lat
    this.lgn = lgn
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
  }else if (props.alert === 1){
    return <div className="alert alert-warning" align="center">
      The addresses have been searched!
    </div>
  }else if (props.alert === 0){
    return <div className="alert alert-success" align="center">
      The result is successfully found!
    </div>
  }else if (props.alert === 2){
    return <div className="alert alert-dark" align="center">
      Can not find the address in Google Map!
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
    this.calculateAddr = this.calculateAddr.bind(this);
    this.getGeo = this.getGeo.bind(this);
    this.pruneAddr = this.pruneAddr.bind(this);
    this.getResponse = this.getResponse.bind(this);
    this.state = {
      addrA: undefined,
      addrB: undefined,
      res: [],
      hist: [],
      alert: 3
    };
  }

  // Prune input address
  pruneAddr(s){
    // let english = /^[a-zA-Z0-9]+$/;
    let sNew = "";
    s.split(/[-\/\\^$*+?.()|[\]{}]/g).forEach((e) => {
      if (e.length > 0){
        sNew += e.split(" ").join("+");
      }
    });
    // for (let i = 0; i < sNew.length; i++){
    //   let c = sNew.charAt(i);
    //   if (c === '+' || c === ','){
    //     continue;
    //   }else{
    //     if (!english.test(sNew)){
    //       sNew = undefined;
    //       break;
    //     }
    //   }
    // }
    return sNew;
  }

  // Get response from google map
  getResponse(url){
    let res;
    res = fetch(url).then(res => res.json()).then(data => {
      if (data.status === "OK"){
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
    let url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBLmRww05E9gjXov0_hkfFw74vfYoKFLuM&address=";
    let addrA = this.pruneAddr(A);
    let addrB = this.pruneAddr(B);
    if (addrA === undefined || addrB === undefined){
      this.setState(() => {
        return {
          alert: -1
        };
      });
      return false;
    }
    let urlA = url.concat(addrA);
    let urlB = url.concat(addrB);
    let geoA = this.getResponse(urlA);
    let geoB = this.getResponse(urlB);
    if (geoA === undefined || geoB === undefined){
      this.setState(() => {
        return {
          alert: 2
        }
      });
    }

  }

  // Calculate to get the nearest places
  calculateAddr(e) {
    e.preventDefault();
    let addrA = e.target.elements.addrA.value.trim();
    let addrB = e.target.elements.addrB.value.trim();
    // console.log("A: " + addrA + " B: " + addrB);
    if (addrA === "" || addrB === ""){
        this.setState(() => {
          return {
            alert: -1
          };
        });
    }else{
      let isFound = this.state.hist.some((e) => {
        return e.addrB === addrB && e.addrA === addrA
      })

      this.getGeo(addrA, addrB);


      //TODO get the list of real estates within 10 miles of each addresses
      let mike = new result("Whole Foods", 1, 2, 3);
      let join = new result("Foot Locker", 2, 3, 5);
      let tmpRes = [mike, join];
      let tmpHist = new history(tmpRes[0].name, tmpRes[0].distanceA, tmpRes[0].distanceB, addrA, addrB);
      this.setState((prev) => {
          return{
          alert: isFound? 1: 0,
          res: tmpRes,
          hist: isFound? prev.hist: [tmpHist].concat(prev.hist)
        };
      });


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
          <div className="col-md-4">
            <h3>Panel</h3>
            <AddForm
              calculateAddr={this.calculateAddr}
              getGeo={this.getGeo}
            />
            <div id="MyMap">
              <MyMapComponent />
            </div>
          </div>
          <div className="col-md-4">
            <h3>Result</h3>
            <GetResult
              res={this.state.res}
            />
          </div>
          <div className="col-md-4">
            <h3>History</h3>
            <GetHistory
              hist={this.state.hist}
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
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&",
    loadingElement: <div style={{height: `100%`}}/>,
    containerElement: <div style={{width: `585px`, height: `500px`}}/>,
    mapElement: <div style={{height: `100%`}}/>
  }),
  withScriptjs,
  withGoogleMap
)((props) =>
  <GoogleMap
    defaultZoom={10}
    defaultCenter={{lat: 32.0181602, lng: -99.7738947}}
  >
    <Marker label="A" position={{lat: 32.0181602, lng: -99.7738947}} onClick={props.onToggleOpen}/>
    <Marker label="B" position={{lat: 32.02, lng: -99.6}} onClick={props.onToggleOpen}/>
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
    }, 3000)
  }

  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false })
    this.delayedShowMarker()
  }

  render() {
    return (
      <GoogleMapComponent
        isMarkerShown={this.state.isMarkerShown}
        onMarkerClick={this.handleMarkerClick}
      />
    )
  }

}


/*Address form to use
* */
class AddForm extends Component{
  render() {
        return (<form className="form-inline" onSubmit={this.props.calculateAddr}>
          <span className="badge badge-pill badge-success">A</span>
          <div className="form-group mx-sm-4">
            <label className="sr-only">Address of A</label>
            <input type="text" className="form-control" placeholder="Address of A" name="addrA"/>
          </div>
          <span className="badge badge-pill badge-danger">B</span>
          <div className="form-group mx-sm-4">
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
      return ( <table className="table">
      <thead className="thead-light">
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Distance From A</th>
        <th>Distance From B</th>
      </tr>
      </thead>
      <tbody>
      {this.props.res.length > 0 && (this.props.res.map((p) =>{
        return (
          <tr key={p.num}>
            <td>{p.num}</td>
            <td>{p.name}</td>
            <td>{p.distanceA}</td>
            <td>{p.distanceB}</td>
          </tr>
        )
      }))}
      </tbody>
    </table>
  );
  }
}

/*History table to store the result
* */
class GetHistory extends Component{
    render() {
      return(<table className="table">
        <thead className="thead-dark">
        <tr>
          <th>Name</th>
          <th>Address of A</th>
          <th>Address of B</th>
          <th>Distance From A</th>
          <th>Distance From B</th>
        </tr>
        </thead>
        <tbody>
        {this.props.hist.length > 0 && (this.props.hist.map((p) => {
          return (<tr key={p.num}>
            <td>{p.name}</td>
            <td>{p.addrA}</td>
            <td>{p.addrB}</td>
            <td>{p.distanceA}</td>
            <td>{p.distanceB}</td>
          </tr>)}))}
        </tbody>
      </table>
    );
  }
}


export default Distance;



