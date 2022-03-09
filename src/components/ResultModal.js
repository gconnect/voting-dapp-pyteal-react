import { useState } from 'react';
import {Modal, Button, Table, Row, Col} from 'react-bootstrap'
import styled from 'styled-components';
import { CONSTANTS } from './Constants';
import algosdk from'algosdk';



export default function ResultModal(props){
  const [radioValue, setRadioValue] = useState(0);


  const radios = [
    {id: 1,  name: 'James Doe', value: '1', party: 'PDP', voteCount: 0},
    {id: 2, name: 'Lino Batilome', value: '2', party: 'APC', voteCount: 2 },
    {id: 3,  name: 'Axe Buckans', value: '3', party: 'APGA', voteCount: 4},
    {id: 4, name: 'Monica Berry', value: '4', party: 'ANPP', voteCount:5 },
  ];
  const endDate = localStorage.getItem("endDate")
  const client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port, CONSTANTS.headers)


// read global state of application
  const readGlobalState = async (index) => {
    try{
      let applicationInfoResponse = await client.getApplicationByID(index).do();
      let globalState = applicationInfoResponse['params']['global-state']
      return globalState.map((state) =>{
        return state
      })
    }catch(err){
      console.log(err)
    }
  }
  const args = [
    btoa("RegBegin"),
    btoa("RegEnd"),
    btoa("VoteBegin"),
    btoa("VoteEnd"),
    btoa("Creator"),
  ]

  const gloablState =  readGlobalState(76645072)
  let filteredItems = []
  gloablState.forEach(item => {
  if (!args.includes(item.key)) {
    filteredItems.push(item)
  }
})

//Code to get the winners
let maxGame = filteredItems.reduce((max, item) => max.value.uint > item.value.uint ? max.key : item);
console.log(atob(maxGame))

//Get all Candidates
filteredItems.map((item) => item)

  return(
    <div>
         <Modal
      show= {props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered  
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Election Result
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
        <Row>
          <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Party</th>
                <th>Vote Count</th>
              </tr>
            </thead>
          {filteredItems.map((radio, idx) => ( 
            <tbody key={idx}>
              <tr>
                <td>{radio.idx}</td>
                <td>{atob(radio.key)}</td>
                <td>{radio.party}</td>
                <td>{radio.value.uint}</td>
              </tr>
            </tbody>
          ))}
          </Table>
          </Col>
          <Col>
            <Row>
              <Col>
                <p>Staked Voted so far </p>
                <h5>0 Algo</h5>
              </Col>
              <Col>
                <p>Governors Voted </p>
                <h5>0</h5>
              </Col>
            </Row>          
          </Col>
        </Row>
      </div> 
      </Modal.Body>
    </Modal>
    </div>
  )
}

 