/*global AlgoSigner*/
import { useState, useRef } from 'react';
import {Modal, Button} from 'react-bootstrap'
import styled from 'styled-components';
import algosdk from'algosdk';
import { CONSTANTS } from './Constants';

const RadioContainer = styled.div`
  border: 0.5px solid black;
  padding: 8px;
  margin: 24px;
  display: flex;
  justify-content: space-between;
  flex-direction: row-reverse;
  &:hover {
    background-color: #2ff;
  }
  .title{
    font-size: 24px;
    padding: 8px;
  }
`


export default function CandidateModal(props){
  const [radioValue, setRadioValue] = useState(0);
  let userAccount = useRef()

  const radios = [
    { name: 'John Doe', value: 'John Doe', party: 'PDP'},
    { name: 'Lino Batilome', value: 'Lino Batilome', party: 'APC' },
    { name: 'Alice Axe', value: 'Alice Axe', party: 'APGA' },
    { name: 'Bob Marley', value: 'Bob Marley', party: 'ANPP' },
  ];

  
// const endDate = localStorage.getItem("endDate")
let client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port)

  //  CALL(NOOP)
// call application with arguments
const noop = async (index, choice)  => {
  try{
    userAccount.current =   await AlgoSigner.accounts({
      ledger: 'TestNet'
    })
    const sender = userAccount.current[0]['address']
// console.log(userAccount.current[0]['address'])
console.log(userAccount.current)

  let vote = "vote"
  // let choice = localStorage.getItem("candidate")
  // console.log("choice is " + choice)
  const appArgs = []
  appArgs.push(
    new Uint8Array(Buffer.from(vote)),
    new Uint8Array(Buffer.from(choice)),
   )
  let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;

  // create unsigned transaction
  let txn = algosdk.makeApplicationNoOpTxn(sender, params, index, appArgs)
    // Sign the transaction

    // Use the AlgoSigner encoding library to make the transactions base64
    const txn_b64 = await AlgoSigner.encoding.msgpackToBase64(txn.toByte());

    let signedTxs  = await AlgoSigner.signTxn([{txn: txn_b64}])
    console.log(signedTxs)
    
    // Get the base64 encoded signed transaction and convert it to binary
    let binarySignedTx = await AlgoSigner.encoding.base64ToMsgpack(signedTxs[0].blob);

    // Send the transaction through the SDK client
    let txId = await client.sendRawTransaction(binarySignedTx).do();
      console.log(txId)

    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
    console.log("confirmed" + confirmedTxn)

    //Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

  // display results
  let transactionResponse = await client.pendingTransactionInformation(txId).do();
  console.log("Called app-id:",transactionResponse['txn']['txn']['apid'])
  if (transactionResponse['global-state-delta'] !== undefined ) {
      console.log("Global State updated:",transactionResponse['global-state-delta']);
  }
  if (transactionResponse['local-state-delta'] !== undefined ) {
      console.log("Local State updated:",transactionResponse['local-state-delta']);
  }
  }catch(err){
    console.log(err)
  }
}

const submitVoteHandler = ()=>{
  const value= radioValue
   console.log(value)
   noop(CONSTANTS.APP_ID, value)
 }

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
          Presidential Candidates
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div>
        {  
        radios.map((radio, idx) => (
            <RadioContainer key={idx} >
              <input type="radio" id={radio.name} name="candidates" value={radio.value} checked={radioValue === radio.value}
            onChange={(e) => setRadioValue(e.currentTarget.value)}/>
                <label className='title' for={radio.name}>
                  {radio.name}
                  <p>{radio.party}</p>
                </label>
            </RadioContainer>
          ))}
      </div>
      </Modal.Body>
       <Modal.Footer>
        <Button onClick={() =>submitVoteHandler()}>Submit Vote</Button>
      </Modal.Footer>
      
    </Modal>
    </div>
  )
}

 