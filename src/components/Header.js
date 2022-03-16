/*global AlgoSigner*/
import React, {useRef, useState} from 'react';
import {Container,Row, Col, Button} from 'react-bootstrap'
import logo from '../assets/images/AlgoVote.svg'
import { CONSTANTS } from './Constants';
import algosdk from'algosdk';
import MessageAlert from './Alert';

export default function Header (){
  let client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port)
  const [alert, setAlert] = useState(false)

  let userAccount = useRef()
  const connectAlgoSigner = async () => {
    await AlgoSigner.connect()
        getUserAccount()
  }

  const getUserAccount = async () =>{
    userAccount.current =  await AlgoSigner.accounts({
         ledger: 'TestNet'
       })
 console.log(userAccount.current[0]['address'])
//  console.log(userAccount.current)
  
 }

 //OPTIN
// create unsigned transaction
const Optin = async (sender, index) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;

    let txn = algosdk.makeApplicationOptInTxn(sender, params, index);
    // sign, send, await
    // Sign the transaction

    const txn_b64 = await AlgoSigner.encoding.msgpackToBase64(txn.toByte());

    let signedTxs  = await AlgoSigner.signTxn([{txn: txn_b64}])
     console.log(signedTxs)

     // Get the base64 encoded signed transaction and convert it to binary
   let binarySignedTx = await AlgoSigner.encoding.base64ToMsgpack(signedTxs[0].blob);

    // Send the transaction through the SDK client
   let txId = await client.sendRawTransaction(binarySignedTx).do();
       console.log(txId)
                          
  // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
    console.log("confirmed" + confirmedTxn)

  //Get the completed Transaction
  console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    console.log("Opted-in to app-id:",transactionResponse['txn']['txn']['apid'])
  }catch(err){
    console.log(err)
  }
}
  const register = () => {
    if(userAccount.current === undefined){
      // alert("Connect your wallet")
      setAlert(true)
    }else{
      Optin(userAccount.current[0].address,CONSTANTS.APP_ID)
    }

  }
  const handleClose = () =>{
    setAlert(false)
  }
  return(
    <div>
      <Container style={{marginTop: '24px'}}>
        <Row>
          <Col>
            <img src={logo}  alt='vote'/>
          </Col>
          <Col>
            <div>
            {/* <label for="StartDate">Start Date</label> */}
            {/* <input type="date" id="start" name="startDate" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)}/> */}
            {/* <h5>Reg Time</h5> */}
            </div>
            <div>
            {/* <label for="EndDate">End Date</label> */}
            {/* <h5>Vote Time</h5> */}
            {/* <input type="date" id="end" name="endDate" value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)}/> */}
            </div>
          </Col>
          <Col md='4' style={{display: 'inline'}}> 
          {/* <h4>Voting Ends in </h4> */}
          <Button style={{backgroundColor: 'orange'}} onClick={() => register()}>Register</Button>
          {/* <h4 id='demo' style={{color: 'red'}}></h4> */}
          <MessageAlert show={alert} close={() => handleClose()} variant={"danger"} title="Connect Wallet" message= "Please connect your wallet"/>
          </Col>
          <Col md='auto'>
            <Button style={{backgroundColor: '#6C63FF'}} onClick={connectAlgoSigner}>Connect Wallet</Button>
          </Col>
        </Row>
      </Container>
    </div>
  )
}