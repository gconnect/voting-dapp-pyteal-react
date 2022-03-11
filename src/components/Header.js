/*global AlgoSigner*/
import React, {useRef} from 'react';
import {Container,Row, Col, Button} from 'react-bootstrap'
import logo from '../assets/images/AlgoVote.svg'
import { CONSTANTS } from './Constants';
import algosdk from'algosdk';
import env from 'process'

export default function Header (){
//   useEffect(() =>{
//     setCountDownDate(countDownTimerHandler()
//     )
//   },[])

// const countDownTimerHandler = () =>{
//     // Set the date we're counting down to
//     const msc = Date.parse(endDate)
// let countDownDate = new Date(msc).getTime();
// // let countDownDate = new Date("Jan 5, 2024 15:37:25").getTime();

// // Update the count down every 1 second
// let x = setInterval(function() {

//   // Get today's date and time
//   const ms = Date.parse(startDate)
//   let now = new Date(ms).getTime();
    
//   // Find the distance between now and the count down date
//   let distance = countDownDate - now;
    
//   // Time calculations for days, hours, minutes and seconds
//   let days = Math.floor(distance / (1000 * 60 * 60 * 24));
//   let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//   let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//   let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
//   // Output the result in an element with id="demo"
//  const countDown = document.getElementById("demo").innerHTML = days +  "d " + hours + "h "
//   + minutes + "m " + seconds + "s ";
//   const endDate = seconds
//     localStorage.setItem("endDate", endDate)
//   // If the count down is over, write some text 
//   if (distance < 0) {
//     clearInterval(x);
//     document.getElementById("demo").innerHTML = "VOTING HAS ENDED";
//   }
// }, 1000);
//   }

  // const [startDate, setStartDate]= useState("")
  // const [endDate, setEndDate] = useState("")
  // // const [countDownDate, setCountDownDate] = useState(countDownTimerHandler())
  // console.log(startDate)
  // console.log(endDate)

  // const regTime = localStorage.getItem("start")
  // const voteTime = localStorage.getItem('end')

  // // configure registration and voting period
  // let status =  client.status().do().then(({}))
  // console.log(status)
  // let RegBegin =  status['last-round'] + 10
  // // let regBegin =  status['time-since-last-round'] + 60
  // let RegEnd = RegBegin + 10
  // let VoteBegin = RegEnd + 10
  // let VoteEnd = VoteBegin + 10

  // const regTime = `Registration rounds: ${RegBegin} to ${RegEnd}`
  // const voteTime = `Vote rounds: ${VoteBegin} to ${VoteEnd}`
  let userAccount = useRef()
  const connectAlgoSigner = async () => {
    let resp = await AlgoSigner.connect()
        console.log(resp)
        getUserAccount()
        // if()
  }

  const getUserAccount = async () =>{
    userAccount.current =  await AlgoSigner.accounts({
         ledger: 'TestNet'
       })
 // console.log(userAccount.current[0]['address'])
 console.log(userAccount.current)
       
 }
 const token =  {"x-api-key" : process.env.REACT_APP_API_KEY}


 let client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port)

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
  return(
    <div>
      <Container style={{marginTop: '24px'}}>
        <Row>
          <Col>
            <img src={logo}  alt='vote'/>
          </Col>
          <Col>
            <div>
            {/* <label for="StartDate">StartDate:</label> */}
            {/* <input type="date" id="start" name="startDate" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)}/> */}
            {/* <h5>Reg Time</h5> */}
            </div>
            <div>
            {/* <label for="EndDate">EndDate:</label> */}
            {/* <h5>Vote Time</h5> */}
            {/* <input type="date" id="end" name="endDate" value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)}/> */}
            </div>
          </Col>
          <Col md='4' style={{display: 'inline'}}> 
          {/* <h4>Voting Ends in </h4> */}
          <Button style={{backgroundColor: 'orange'}} onClick={() => Optin(userAccount.current[0].address,CONSTANTS.APP_ID)}>Register</Button>
          {/* <h4 id='demo' style={{color: 'red'}}></h4> */}
          </Col>
          <Col md='auto'>
            <Button style={{backgroundColor: '#6C63FF'}} onClick={connectAlgoSigner}>Connect Wallet</Button>
          </Col>
        </Row>
      </Container>
    </div>
  )
}