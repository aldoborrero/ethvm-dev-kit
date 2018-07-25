#!/usr/bin/env node

import * as rpc from '@enkrypt.io/json-rpc2'
import commander from 'commander'
import { simpleEncode } from 'ethereumjs-abi'
import EthereumTx from 'ethereumjs-tx'
import { bufferToHex, generateAddress, toBuffer } from 'ethereumjs-util'
import * as utils from 'web3-utils'
import Ora from 'ora'

import data from './accounts.json'

const { accounts, tokencontract, from } = data

const version = '1.0.0'

const ora = new Ora({
  color: 'yellow'
})
const r = rpc.Client.$create(8545, 'localhost')

interface Txp {
  from: string
  to: string
  nonce?: string
  gas?: string
  data?: any
  gasPrice?: string
  value?: string
}

interface Result {
  res: string
  contractAddress: string
}

const txParams = {
  from: from.address,
  to: '0x53d5f815e1ffb43297cdDf1E4C94950ae464c912',
  nonce: '0x00',
  gas: '0x7B0C',
  data: null,
  gasPrice: '0x000000001',
  value: '0x1'
}

commander.description('Ethereum utility that helps to create random txs to aid in development').version(version, '-v, --version')

function send(txP: Txp, privateKey: Buffer): Promise<Result> {
  return new Promise((resolve, reject) => {
    r.call(
      'eth_getTransactionCount',
      [txP.from, 'latest'],
      (e: Error, res: any): void => {
        const nonce = parseInt(res)
        txP.nonce = '0x' + nonce.toString(16)
        const ca = generateAddress(toBuffer(txP.from), toBuffer(txP.nonce))
        const tx = new EthereumTx(txP)
        tx.sign(privateKey)
        const serializedTx = '0x' + tx.serialize().toString('hex')
        r.call(
          'eth_sendRawTransaction',
          [serializedTx],
          (e: Error, res: any): void => {
            if (e) {
              reject(e)
              return
            }
            resolve({ res: res, contractAddress: bufferToHex(ca) })
          }
        )
      }
    )
  })
}

function ethcall(txParams: Txp): Promise<any> {
  txParams.nonce = ''
  return new Promise((resolve, reject) => {
    r.call(
      'eth_call',
      [txParams, 'latest'],
      (e: Error, res: any): void => {
        if (e) {
          reject(e)
          return
        }
        resolve({ res: res })
      }
    )
  })
}

async function fillAccountsWithEther(txParams: Txp): Promise<any> {
  for (const account of accounts) {
    txParams.to = account.address
    txParams.value = '0x2000000000000000'
    const privateKey = Buffer.from(from.key, 'hex')
    try {
      ora.info(`Sending: ${txParams.value} wei to ${txParams.to}`)
      const done = await send(txParams, privateKey)
      ora.info(`Tx hash: ${JSON.stringify(done.res)}`)
    } catch (error) {
      ora.fail(JSON.stringify(error))
    }
  }

  ora.succeed('Filled all accounts with ether')
  ora.stopAndPersist()

  return Promise.resolve()
}

async function sendRandomTX(txParams: Txp, iter: Number = 10): Promise<any> {
  let sent = 0
  let i = 0
  while (i < iter) {
    const to = Math.floor(Math.random() * (accounts.length - 1))
    const from = Math.floor(Math.random() * (accounts.length - 1))

    // Double check we're not sending to the same address
    if (from === to) {
      continue
    }

    const privateKey = Buffer.from(accounts[from].key, 'hex')

    txParams.to = accounts[to].address
    txParams.from = accounts[from].address

    try {
      ora.info(`Sending tx to: ${JSON.stringify(txParams.to)}`)
      const done = await send(txParams, privateKey)
      ora.info(`Tx hash: ${JSON.stringify(done.res)}`)
    } catch (error) {
      ora.fail(JSON.stringify(error))
    }

    i++
    sent++
  }

  ora.info(`Random txs sent: ${sent}`)
  ora.stopAndPersist()

  return Promise.resolve()
}

async function fillAndSend(txParams: Txp): Promise<any> {
  const balance = await checkBalance(txParams.from)
  ora.info(`Balance ${utils.fromWei(balance)}`)

  if (parseInt(balance, 16) < utils.toWei('1')) {
    ora.warn(`Not enough balance in account: ${txParams.from}`)
    return Promise.reject()
  }

  await sendRandomTX(txParams)
  return Promise.resolve()
}

async function contractTxs(txParams: Txp): Promise<any> {
  const privateKey = Buffer.from(from.key, 'hex')

  let contractAddress: string = ''
  try {
    ora.info('Deploying contract...')
    const done = await send(txParams, privateKey)
    ora.info(`Contract address: ${done.contractAddress}`)
    contractAddress = done.contractAddress
  } catch (error) {
    ora.fail(JSON.stringify(error))
  }

  txParams.to = ''
  txParams.value = ''
  txParams.data = tokencontract.data
  txParams.gas = '0x47B760'
  txParams.to = contractAddress

  // send token to all accounts
  for (const account of accounts) {
    txParams.data = bufferToHex(simpleEncode('transfer(address,uint256):(bool)', account.address, 6000))
    try {
      ora.info(`Calling transfer of contract address: ${JSON.stringify(txParams.to)}`)
      const done = await send(txParams, privateKey)
      ora.info(`Tx hash: ${JSON.stringify(done.res)}`)
    } catch (error) {
      ora.fail(JSON.stringify(error))
      return Promise.reject(error)
    }
  }

  return Promise.resolve()
}

async function checkBalance(addr): Promise<any> {
  return new Promise((resolve, reject) => {
    r.call(
      'eth_getBalance',
      [addr, 'latest'],
      (e: Error, res: any): void => {
        if (e) {
          reject(e)
          return
        }
        resolve(res)
      }
    )
  })
}

async function txDetails(txhash): Promise<any> {
  return new Promise((resolve, reject) => {
    r.call(
      'eth_getTransactionByHash',
      [txhash],
      (e: Error, res: any): void => {
        if (e) {
          reject(e)
          return
        }
        resolve(res)
      }
    )
  })
}

commander
  .command('random')
  .alias('r')
  .action(() => {
    ora.info('Randomizing txs...').start()
    fillAndSend(txParams)
  })

commander
  .command('fill')
  .alias('f')
  .action(() => {
    ora.info('Filling accounts with ether...').start()
    fillAccountsWithEther(txParams)
  })

commander
  .command('deploy')
  .alias('d')
  .action(() => {
    ora.info('Deploying token contract and sending tokens to all accounts...').start()
    contractTxs(txParams)
  })

commander
  .command('balance')
  .alias('b')
  .action(address => {
    ora.info(`Obtaining balance of address: ${address}`)
    r.call(
      'eth_getBalance',
      [address, 'latest'],
      (e: Error, res: any): void => {
        if (e) {
          ora.clear()
          ora.fail(JSON.stringify(e))
          ora.stopAndPersist()
          return
        }

        ora.clear()
        ora.succeed(`Current balance: ${utils.fromWei(res, 'ether')} ether`)
        ora.stopAndPersist()
      }
    )
  })

commander.parse(process.argv)
