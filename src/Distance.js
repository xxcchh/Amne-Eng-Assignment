import React, {Component} from 'react';
import './Distance.css';

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

/*
* Function to show alert messages
* */
function ShowAlert(props){
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
    this.state = {
      addrA: undefined,
      addrB: undefined,
      res: [],
      hist: [],
      alert: 2
    };
  }

  calculateAddr(e) {
    e.preventDefault();
    let addrA = e.target.elements.addrA.value.trim();
    let addrB = e.target.elements.addrB.value.trim();
    console.log("A: " + addrA + " B: " + addrB);
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
            />
            <p>Google Map</p>
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



