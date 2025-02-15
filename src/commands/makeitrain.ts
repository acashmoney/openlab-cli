import {CliUx, Command, Flags} from '@oclif/core'
import Web3 from 'web3'
import userConfig from '../config'
import fs from 'fs'
import os from 'os'
import testusdJson from '../abis/testusd.json'
import { AbiItem } from 'web3-utils'

const getSpaces = () => {
  const n = Math.floor(Math.random() * (300 - 1)) + 1;
  let spaces = "";

  for(let i = 0; i < n; i ++) spaces += " ";

  return spaces;
};

const rain = () => {
  setInterval(() => {
    console.log(getSpaces() + "/");
  }, 100);
};

export default class MakeItRain extends Command {
    static description = 'Mint test USD tokens'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
    ]
    public async run(): Promise<void> {
        const web3 = new Web3(userConfig.get('provider').maticMumbai)
        const baseDir = os.homedir()+'/.openlab'
        if (!fs.existsSync(baseDir+'/wallet.json')) {
            this.log("Wallet doesn't exist")
        }
        else {
            const usdToken = '0x7fD2493c6ec0400be7247D6A251F00fdccc17375'
            const password = await CliUx.ux.prompt('Enter a password to decrypt your wallet', {type: 'hide'})
            const keystoreJsonV3 = JSON.parse(fs.readFileSync(baseDir+'/wallet.json', 'utf-8'))
            const account = web3.eth.accounts.decrypt(keystoreJsonV3, password)
            web3.eth.accounts.wallet.add(account)
            this.log(`Minting USD tokens...`)
            rain()
            const testusdContract = new web3.eth.Contract(testusdJson as AbiItem[], usdToken)
            await testusdContract.methods.mint().send({'from': account.address, 'gasLimit': 100000, 'gasPrice': web3.utils.toWei('30', 'gwei')})
            process.exit(0)
        }
    }
}
