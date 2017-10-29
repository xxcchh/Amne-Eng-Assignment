import React, { Component } from 'react'
import { compose, withProps } from 'recompose'
import { GoogleMap, Marker, withGoogleMap, withScriptjs } from 'react-google-maps'
import './Distance.css'

const fetch = require("isomorphic-fetch");


/*
* Result class
* */
class result {
 constructor (id, estateName, number, addrA, addrB){
   this.id;
   this.name = estateName
   this.num = number
   this.distanceA = addrA
   this.distanceB = addrB
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
    this.onChange = (address) => this.setState({address});
    this.state = {
      addrA: undefined,
      addrB: undefined,
      res: [],
      alert: 1
    };
  }

  // Reset address
  resetAddr(){
    this.setState(() => {
      return {
        addrA: undefined,
        addrB: undefined,
        res: []
      }
    });
  }

  // Prune input address
  static pruneAddr(s){
    let exp = /[-\/\\^$*+?.()|[\]{}]/g;
    if (exp.test(s)){
      return undefined;
    }
    let sNew = s.split(" ").join("+");
    return sNew;
  }

  // Get response from google map
  getResponse(url){
    let res;
    let defaultAddr = "Austin, TX, USA";
    res = fetch(url).then(res => res.json()).then(data => {
      // console.log(data);
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
      "&hasNextPage=true&nextPage()=true&sensor=false&type=real_estate_agency&radius=16093.4&location=";
    let lat = geo.lat;
    let lgn = geo.lgn;
    let urlNew = url + lat + "," + lgn;
    // let urlNew = url + "30.273067" + "," + "-97.754059";
    // console.log("url to use:" +   urlNew);
    let proxyURL = 'https://cors-anywhere.herokuapp.com';
    let requestURL = urlNew;
    let request = new XMLHttpRequest();
    request.open('GET', proxyURL + '/' + requestURL, true);
    request.responseType = 'json';
    request.send();
    let res = [];
    request.onload = function() {
      let data = request.response;
      console.log(data);
      if (data.results.length > 0 && data.status === "OK"){
         let tmp = data.results;
         console.log(tmp);
         res = tmp.map((t) => {

         })
      }
    }


  }

  // Calculate to get the nearest places
  calculateAddr(e) {
    e.preventDefault();

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
        let geoARes = res.geoA.then(data => {
          return data === undefined? undefined: this.getList(data);
        });

        let mike = new result("A", "Whole Foods", 1, 2, 3);
        let join = new result("B", "Foot Locker", 2, 3, 5);

        let tmpRes = [mike, join];
        this.setState((prev) => {
          return{
            alert: 0,
            res: tmpRes,
          };
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
            <h3>Result</h3>
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
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&",
    loadingElement: <div style={{height: `100%`}}/>,
    containerElement: <div style={{width: `725px`, height: `500px`}}/>,
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

          {/*<Autocomplete*/}
            {/*style={{width: '90%'}}*/}
            {/*onPlaceSelected={(place) => {*/}
              {/*console.log(place);*/}
            {/*}}*/}
            {/*types={['(regions)']}*/}
            {/*componentRestrictions={{country: "us"}}*/}
          {/*/>*/}

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
        <th>Sum Of Distance</th>
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
            <td>{p.distanceA + p.distanceB}</td>
          </tr>
        )
      }))}
      </tbody>
    </table>
  );
  }
}


export default Distance;



