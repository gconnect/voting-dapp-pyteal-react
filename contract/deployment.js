require('dotenv').config()
const fs = require('fs')
const algosdk = require('algosdk');


//SMART CONTRACT DEPLOYMENT
  // declare application state storage (immutable)
  const localInts = 0;
  const localBytes = 1;
  const globalInts = 24; //# 4 for setup + 20 for choices. Use a larger number for more choices.
  const globalBytes = 1;

  // get accounts from mnemonic
  const creatorMnemonic = "scan wheel heavy boy feature mind achieve crew comfort gauge valve crew assume doll pyramid insane toe tiger shed prevent color gown oil able inmate"
  const userMnemonic = "hotel hole fox quit trend manage universe name sketch maximum toast normal develop favorite actual bean extra husband casual acquire seminar float moment ability nose"
  const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic)
  const userAccout =  algosdk.mnemonicToSecretKey(userMnemonic)
  const creatorSecret = creatorAccount.sk
  const creatorAddress = creatorAccount.addr
  const sender = userAccout.addr

  //Generate Account
  const account = algosdk.generateAccount()
  const secrekey = account.sk
  const mnemonic = algosdk.secretKeyToMnemonic(secrekey)
  console.log("mnemonic " + mnemonic )
  console.log("address " + account.addr )

  console.log()
  // Connect your client
  const algodToken = process.env.REACT_APP_API_KEY;
  const baseServer = 'https://testnet-algorand.api.purestake.io/ps2/';
  const port = "";
  const headers ={"X-API-Key": process.env.REACT_APP_API_KEY}  
    
  console.log(process.env) 
  let client = new algosdk.Algodv2(algodToken, baseServer, port, headers)

  // Read Teal File
  let approvalProgram = ''
  let clear_state_program = ''

  try {
    approvalProgram = fs.readFileSync('../contract/vote_approval.teal', 'utf8')
    clear_state_program = fs.readFileSync('../contract/vote_clear_state.teal', 'utf8')
    console.log(approvalProgram)
    console.log(clear_state_program)
  } catch (err) {
    console.error(err)
  }

  // Compile Program
  const compileProgram = async (client, programSource) => {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await client.compile(programBytes).do();
  let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
  // console.log(compileResponse)
  return compiledBytes;
}

// Rounds
const waitForRound = async (round) => {
  let last_round = await client.status().do()
  let lastRound = last_round['last-round']
  console.log("Waiting for round " + lastRound)
  while (lastRound < round) {
    lastRound +=1
  const block =  await client.statusAfterBlock(lastRound).do()
  console.log("Round " + block['last-round'])
  }
}

// convert 64 bit integer i to byte string
const intToBytes = (integer) => {
  return integer.toString()
}

//CREATE APP
// create unsigned transaction
const createApp = async (sender, 
  approvalProgram, clearProgram, 
  localInts, localBytes, globalInts, globalBytes, app_args) => {
    try{
      const onComplete = algosdk.OnApplicationComplete.NoOpOC;

      let params = await client.getTransactionParams().do()
      params.fee = 1000;
      params.flatFee = true;
      
      console.log("suggestedparams" + params)

        let txn = algosdk.makeApplicationCreateTxn(sender, params, onComplete, 
          approvalProgram, clearProgram, 
          localInts, localBytes, globalInts, globalBytes, app_args);
        let txId = txn.txID().toString();
        // Sign the transaction
        let signedTxn = txn.signTxn(creatorAccount.sk);
        console.log("Signed transaction with txID: %s", txId);
        
        // Submit the transaction
        await client.sendRawTransaction(signedTxn).do()                           
            // Wait for transaction to be confirmed
           let confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
            console.log("confirmed" + confirmedTxn)

            //Get the completed Transaction
            console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
            // display results
            let transactionResponse = await client.pendingTransactionInformation(txId).do()
            let appId = transactionResponse['application-index'];
            console.log("Created new app-id: ",appId);
      }catch(err){
      console.log(err)
    }
}

//OPTIN
// create unsigned transaction
const Optin = async (sender, index) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;

    let txn = algosdk.makeApplicationOptInTxn(sender, params, index);
    let txId = txn.txID().toString();
    // sign, send, await
    // Sign the transaction
    let signedTxn = txn.signTxn(userAccout.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
       const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
        console.log("confirmed" + confirmedTxn)

        //Get the completed Transaction
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        // display results
    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    console.log("Opted-in to app-id:",transactionResponse['txn']['txn']['apid'])
  }catch(err){
    console.log(err)
  }
}


//  CALL(NOOP)
// call application with arguments
const noop = async (sender, index)  => {
  try{
  let vote = "vote"
  let choice = localStorage.getItem("candidate")
  console.log("choice is " + choice)
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

    let txId = txn.txID().toString();
    // Sign the transaction
    let signedTxn = txn.signTxn(userAccout.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
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

//READ STATE
// read local state of application from user account
const readLocalState = async (index) => {
  try{
    let accountInfoResponse = await client.accountInformation(userAccout.addr).do();
    let localState = accountInfoResponse['apps-local-state']
    return localState.map((item)=> {
      if(item['id'] == index){
        console.log("User's local state:" + item.id);
        let localStateItem = accountInfoResponse['apps-local-state'][item]['key-value']
        localStateItem.map((local) =>{
          console.log(local)
          return local
        })
      }
      return item
    })
  }catch(err){
    console.log(err)
  }
}


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

//UPDATE
// create unsigned transaction
const update = async (sender, index, approvalProgram, clearProgram) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;

  let txn = algosdk.makeApplicationUpdateTxn(sender, params, index, approvalProgram, clearProgram);
// sign, send, await
  let txId = txn.txID().toString();
  // Sign the transaction
  let signedTxn = txn.signTxn(creatorAccount.sk);
  console.log("Signed transaction with txID: %s", txId);

  // Submit the transaction
  await client.sendRawTransaction(signedTxn).do()                           
      // Wait for transaction to be confirmed
     const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
      console.log("confirmed" + confirmedTxn)

      //Get the completed Transaction
      console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

  // display results
  let transactionResponse = await client.pendingTransactionInformation(txId).do();
  let appId = transactionResponse['txn']['txn'].apid;
  console.log("Updated app-id: ",appId);
  }catch(err){
    console.log(err)
  }
}


// CLOSE OUT
// create unsigned transaction
const  closeOut = async (sender, index) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;
    let txn = algosdk.makeApplicationCloseOutTxn(sender, params, index)
  // sign, send, await
    let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(userAccout.sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
          // Wait for transaction to be confirmed
         const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
          console.log("confirmed" + confirmedTxn)

          //Get the completed Transaction
          console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

      // display results
      let transactionResponse = await client.pendingTransactionInformation(txId).do();
      console.log("Closed out from app-id:",transactionResponse['txn']['txn']['apid'])
  }catch(err){
    console.log(err)
  }
}


//DELETE
// create unsigned transaction
const deleteApp = async (sender, index) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;
    let txn = algosdk.makeApplicationDeleteTxn(sender, params, index);
    // sign, send, await
    let txId = txn.txID().toString();
      // Sign the transaction
      let signedTxn = txn.signTxn(creatorAccount.sk);
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await client.sendRawTransaction(signedTxn).do()                           
          // Wait for transaction to be confirmed
         const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
          console.log("confirmed" + confirmedTxn)

          //Get the completed Transaction
          console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['txn']['txn'].apid;
    console.log("Deleted app-id: ",appId);
  }catch(err){
    console.log(err)
  }
}


// CLEAR STATE
// create unsigned transaction
const clearState = async (sender, index) => {
  try{
    let params = await client.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;
  let txn = algosdk.makeApplicationClearStateTxn(sender, params, index);
  let txId = txn.txID().toString();
  // sign, send, await
  let signedTxn = txn.signTxn(userAccout.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do()                           
        // Wait for transaction to be confirmed
       const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
        console.log("confirmed" + confirmedTxn)

        //Get the completed Transaction
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
  // display results
  let transactionResponse = await client.pendingTransactionInformation(txId).do();
  let appId = transactionResponse['txn']['txn'].apid;
  console.log("Cleared local state for app-id: ",appId);
  }catch(err){
    console.log(err)
  }
}

const main = async () => {

const approval_program = await compileProgram(client, approvalProgram)
const clear_program = await  compileProgram(client,clear_state_program )

// configure registration and voting period
let status = await client.status().do()
console.log(status)
let RegBegin =  status['last-round'] + 10
// let regBegin =  status['time-since-last-round'] + 60
let RegEnd = RegBegin + 10
let VoteBegin = RegEnd + 10
let VoteEnd = VoteBegin + 10

const regTime = `Registration rounds: ${RegBegin} to ${RegEnd}`
const voteTime = `Vote rounds: ${VoteBegin} to ${VoteEnd}`
localStorage.setItem('start', regTime)
localStorage.setItem('end',voteTime )

console.log(`Registration rounds: ${RegBegin} to ${RegEnd}`)
console.log(`Vote rounds: ${VoteBegin} to ${VoteEnd}`)


// create list of bytes for app args
let appArgs = [];

console.log(appArgs.push(
  new Uint8Array(Buffer.from(intToBytes(RegBegin))),
  new Uint8Array(Buffer.from(intToBytes(RegEnd))),
  new Uint8Array(Buffer.from(intToBytes(VoteBegin))),
  new Uint8Array(Buffer.from(intToBytes(VoteEnd))),
 ))
 
// create new application
// const appId =  createApp(creatorAddress, approval_program, clear_program , localInts, localBytes, globalInts, globalBytes, appArgs)

// App  id 76296212
// # wait for registration period to start
// waitForRound(regBegin)
// console.log("Global state1 " + await readGlobalState(76484944))
// waitForRound(regBegin)

// Optin(userAccout.addr, 76645072)
// waitForRound(voteBegin)

// noop(sender, 76645072)

//  read global state of application
// const localState = await  readLocalState(client, sender,  76641532)
// console.log(localState)

// waitForRound(client, voteEnd)

const gloablState = await readGlobalState(76645072)
console.log(gloablState)

//Converting to base64
// var encodedString = btoa(string)

const args = [
  btoa("RegBegin"),
  btoa("RegEnd"),
  btoa("VoteBegin"),
  btoa("VoteEnd"),
  btoa("Creator"),
  // btoa("choiceA"),
]

let filteredItems = []
gloablState.forEach(item => {
  if (!args.includes(item.key)) {
    filteredItems.push(item)
  }
})
// const xx = Math.max.apply(Math, filteredItems.map(function(o) { return o.value.uint; }))
let maxVote = filteredItems.reduce((max, item) => max.value.uint > item.value.uint ? max.key : item);
console.log(atob(maxVote))

// closeOut(sender, 76641532)
// deleteApp(creatorAddress, 76296212)
// clearState(sender, 76641532)
}
console.log(main())
// return(<div>hello</div>)

