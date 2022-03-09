import algosdk from 'algosdk';

//Generate Account
// const account = algosdk.generateAccount()
// const secrekey = account.sk
// const mnemonic = algosdk.secretKeyToMnemonic(secrekey)
// console.log("mnemonic " + mnemonic )
// console.log("address " + account.addr )

// USE ONLY FOR TESTING PURPOSE
  // Creator account
   export const creatorMnemonic = "scan wheel heavy boy feature mind achieve crew comfort gauge valve crew assume doll pyramid insane toe tiger shed prevent color gown oil able inmate"
   export const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic)
   export const creatorAddress = creatorAccount.addr
   export const creatorSecret = creatorAccount.sk



  // User account
   export const userMnemonic = "hotel hole fox quit trend manage universe name sketch maximum toast normal develop favorite actual bean extra husband casual acquire seminar float moment ability nose"
   export const userAccout = algosdk.mnemonicToSecretKey(userMnemonic)
   export const sender = userAccout.addr
   export const senderSecret = userAccout.sk

