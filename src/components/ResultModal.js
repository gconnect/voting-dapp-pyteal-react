import React from 'react';
import {Modal, Table, Row, Col} from 'react-bootstrap'
import { CONSTANTS } from './Constants';
import algosdk from'algosdk';



export default function ResultModal(props){
  // const [radioValue, setRadioValue] = useState(0);
  // const [filtered, setFiltered] = useState([]);

  const candidates = [
    {id: 1,  name: 'John Doe', value: '1', party: 'PDP', voteCount: 0},
    {id: 2, name: 'Lino Batilome', value: '2', party: 'APC', voteCount: 2 },
    {id: 3,  name: 'Axe Buckans', value: '3', party: 'APGA', voteCount: 4},
    {id: 4, name: 'Monica Berry', value: '4', party: 'ANPP', voteCount:5 },
  ];
  // const endDate = localStorage.getItem("endDate")

  const client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port)
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

// useEffect(() =>{
//     fetchGlobalState()
// })

var filteredItems = []
const fetchGlobalState = async () => {
  const gloablState = await readGlobalState(CONSTANTS.APP_ID)
  gloablState.forEach(item => {
  if (!args.includes(item.key)) {
    filteredItems.push(item)
  }
  console.log(filteredItems)
  //Code to get the winner with the highest vote count
  // let maxGame = filteredItems.reduce((max, item) => max.value.uint > item.value.uint ? max.key : item);
  // console.log(atob(maxGame))
  
  //Get all Candidates that was voted for
  // filteredItems.map((item) => item)
})}
console.log(filteredItems.length)

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
                <th>Vote Count</th>
              </tr>
            </thead>
          {candidates.map((radio, idx) => ( 
            <tbody key={idx}>
              <tr>
                <td>{radio.idx}</td>
                {/* <td>{atob(radio.key)}</td> */}
                <td>{radio.name}</td>
                <td>{radio.value}</td>
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
