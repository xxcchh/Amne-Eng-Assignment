import React, {Component} from 'react';
import './Distance.css';

class result {
 constructor (addrA, addrB){
    this.A = addrA
    this.B = addrB
    this.num = 1
 }
}

let res;

let mike = {
  number: 1,
  name: 'Mike',
  distance: 101,
  printDistance(){
    console.log(`The distance is ${this.distance}`)
  }
}

let join = {
  number: 2,
  name: 'John',
  distance: 200,
  printDistance(){
    console.log(`The distance is ${this.distance}`)
  }
}

let users = [mike, join];

/*
* Main function for the web portal
* */
class Distance extends Component{

  constructor (props){
    super(props);
    this.calculateAddr = this.calculateAddr.bind(this);
    this.changeAddr = this.changeAddr.bind(this);
    this.state = {
      addrA: 'Undefined',
    };
  }

  calculateAddr(e) {
    e.preventDefault();
    let addrA = e.target.elements.addrA.value.trim();
    let addrB = e.target.elements.addrB.value.trim();
    res = new result(addrA, addrB);
    console.log(res);
  };

  changeAddr(){
    this.setState((prev) => {
      return {
        addrA: "Defined"
      };
    });
  }

  render(){
    return (
      <div className="row function">
        <p>A: {this.state.addrA}</p>
       <button onClick={this.changeAddr}> change </button>
        <div className="col-md-4">
          <AddForm calculateAddr={this.calculateAddr}/>
        </div>
        <div className="col-md-4">
          <GetResult />
        </div>
        <div className="col-md-4">
          <GetHistory res={res}/>
        </div>
      </div>
    );
  }

}

/*Address form to use.
* */
class AddForm extends Component{

  constructor (props){
    super(props);
    this.calculateAddr = this.props.calculateAddr;
  }

  render() {
        return (<form className="form-inline" onSubmit={this.calculateAddr}>
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
* Result table to use.
* */
class GetResult extends Component{
  render() {
      return ( <table className="table">
      <thead className="thead-light">
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Distance</th>
      </tr>
      </thead>
      <tbody>
      {users.map((p) =>{
        return (
          <tr key={p.number}>
            <td>{p.number}</td>
            <td>{p.name}</td>
            <td>{p.distance}</td>
          </tr>
        )
      })}
      </tbody>
    </table>
  );
  }
}

/*History table to store the result.
* */
class GetHistory extends Component{
    constructor (props){
      super(props);
      this.p = this.props.res;
    }
    render() {
      return(<table className="table">
        <thead className="thead-dark">
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Distance</th>
        </tr>
        </thead>
        <tbody>
        {this.p &&
        <tr key={this.p.num}><td>{this.p.A}</td>
          <td>{this.p.B}</td><td>{this.p.distance}</td></tr>
        }
        </tbody>
      </table>
    );
  }
}


export default Distance;



