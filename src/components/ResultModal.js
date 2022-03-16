import React from 'react';
import {Modal, Table, Row, Col} from 'react-bootstrap'
import { CONSTANTS } from './Constants';

export default function ResultModal(props){
let myList = []
let value = 0
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
      {props.loading ? <h3>Loading...</h3> :
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
          {props.data.map((radio, idx) => ( 
            <tbody key={idx}>
              <tr>
                <td>{radio.idx}</td>
                <td>{atob(radio.key)}</td>
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
                {
                  props.data.map((item) => {
                   myList.push(item.value.uint)
                   value = myList.reduce((a, b) => a + b, 0)
                   return console.log(value)
                  })
                }
                <h5>{value}</h5>
              </Col>
              <a href={CONSTANTS.explorer}>Check the result on the Algo explorer</a>
            </Row>          
          </Col>
        </Row>
      </div> 
      </Modal.Body> }
    </Modal>
    </div>
  )
}
